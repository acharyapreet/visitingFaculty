const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const {
    sequelize,
    User,
    Course,
    Bill,
    BillDetail
} = require("../Schema");

// =================================================================
// Helper — resolve courseId → course_name (used to filter BillDetail)
// =================================================================
const resolveCourse = async (courseId) => {
    const course = await Course.findByPk(courseId);
    if (!course) {
        throw new Error(`Course not found for ID: ${courseId}`);
    }
    return course;
};

// =================================================================
// Core aggregation logic
//
// For a given month + year (and optional course), this function:
//   1. Fetches all Bills for that period
//   2. For each bill, collects BillDetails
//   3. Optionally filters details by course_name
//   4. Groups totals:  semester_number → faculty → amount
// =================================================================
const aggregateSummary = async ({ month, year, courseId }) => {

    // -- 1. Build include for BillDetail ---------------------------------
    // We always include BillDetail; if courseId is given we resolve the
    // course_name and filter on it (BillDetail stores course_name as string).
    let course = null;
    let courseNameFilter = {};

    if (courseId) {
        course = await resolveCourse(courseId);
        courseNameFilter = { where: { course_name: course.course_name } };
    }

    // -- 2. Fetch bills -------------------------------------------------
    const bills = await Bill.findAll({
        where: { month, year: Number(year) },
        include: [
            {
                model: User,
                attributes: ["user_id", "full_name", "uvfin"]
            },
            {
                model: BillDetail,
                ...courseNameFilter
            }
        ]
    });

    // -- 3. Aggregate ---------------------------------------------------
    // semesterMap  = { semesterNumber: { facultyId: { faculty_name, amount } } }
    const semesterMap = {};
    let grandTotal = 0;
    let grandTotalHours = 0;
    const courseName = course ? course.course_name : null;

    for (const bill of bills) {
        const facultyName = bill.User ? bill.User.full_name : "Unknown";
        const facultyId   = bill.user_id;

        for (const detail of bill.BillDetails) {

            // If no course filter, group results by course_name as well
            const detailCourseName = detail.course_name;
            const semKey = detail.semester_number;
            const amount = Number(detail.amount);
            const hours  = Number(detail.hours);

            if (!semesterMap[semKey]) {
                semesterMap[semKey] = {};
            }

            // Unique key per faculty inside this semester
            const facKey = `${facultyId}__${detailCourseName}`;
            if (!semesterMap[semKey][facKey]) {
                semesterMap[semKey][facKey] = {
                    faculty_id:    facultyId,
                    faculty_name:  facultyName,
                    course_name:   detailCourseName,
                    total_amount:  0,
                    total_hours:   0
                };
            }

            semesterMap[semKey][facKey].total_amount += amount;
            semesterMap[semKey][facKey].total_hours  += hours;
            grandTotal      += amount;
            grandTotalHours += hours;
        }
    }

    // -- 4. Convert map → sorted array ----------------------------------
    const semesters = Object.keys(semesterMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map(semNum => {
            const faculties = Object.values(semesterMap[semNum]);
            const semesterTotal = faculties.reduce((s, f) => s + f.total_amount, 0);
            return {
                semester_number: semNum,
                faculties: faculties.map(f => ({
                    ...f,
                    total_amount: Number(f.total_amount.toFixed(2)),
                    total_hours:  Number(f.total_hours.toFixed(2))
                })),
                semester_total: Number(semesterTotal.toFixed(2))
            };
        });

    return {
        month,
        year: Number(year),
        course,
        courseName,
        semesters,
        grandTotal:      Number(grandTotal.toFixed(2)),
        grandTotalHours: Number(grandTotalHours.toFixed(2)),
        totalFaculties:  bills.length
    };
};

// =================================================================
// getMonthlySummary — single course
// GET /api/monthly-summary?month=July&year=2026&courseId=1
// =================================================================
const getMonthlySummary = async (month, year, courseId) => {
    if (!month || !year) {
        throw new Error("month and year are required.");
    }
    return await aggregateSummary({ month, year, courseId: courseId || null });
};

// =================================================================
// getAllCoursesMonthlySummary — all courses, grouped by course
// GET /api/monthly-summary/all?month=July&year=2026
// =================================================================
const getAllCoursesMonthlySummary = async (month, year) => {
    if (!month || !year) {
        throw new Error("month and year are required.");
    }

    // Fetch all active courses
    const courses = await Course.findAll({ where: { is_active: true } });

    const results = await Promise.all(
        courses.map(course =>
            aggregateSummary({ month, year, courseId: course.course_id })
        )
    );

    const grandTotal = results.reduce((s, r) => s + r.grandTotal, 0);

    return {
        month,
        year: Number(year),
        courses: results.filter(r => r.semesters.length > 0),  // only courses that have data
        grandTotal: Number(grandTotal.toFixed(2))
    };
};

// =================================================================
// PDF Generator — Monthly Summary Report
// Layout matches the screenshot:
//   Header → Institution + Summary Report title
//   Month/Year + Program Name
//   Table: Semester → Faculty Name | Amount
//   Grand Total row
//   Footer: Program In-charge signature
// =================================================================
const generateSummaryPDF = (summaryData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });

            const uploadDir = path.join(__dirname, "../uploads/summaries");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const safeMonth = summaryData.month.replace(/\s/g, "_");
            const safeCourse = (summaryData.courseName || "all")
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase();
            const fileName = `summary-${safeCourse}-${safeMonth}-${summaryData.year}.pdf`;
            const pdfPath  = path.join(uploadDir, fileName);
            const stream   = fs.createWriteStream(pdfPath);

            stream.on("finish", () => resolve(pdfPath));
            stream.on("error", reject);
            doc.on("error", reject);
            doc.pipe(stream);

            const PAGE_WIDTH  = 595.28;
            const MARGIN      = 60;
            const USABLE_W    = PAGE_WIDTH - MARGIN * 2;
            const COL_NAME_W  = USABLE_W - 120;
            const COL_AMT_W   = 120;

            // ── HEADER ──────────────────────────────────────────
            doc.font("Helvetica-Bold").fontSize(12)
               .text("International Institute of Professional Studies", MARGIN, 50, {
                   width: USABLE_W, align: "center"
               });

            doc.font("Helvetica-Bold").fontSize(11)
               .text("Devi Ahilya Vishwavidyalaya, Indore", MARGIN, doc.y + 2, {
                   width: USABLE_W, align: "center"
               });

            doc.font("Helvetica-Bold").fontSize(11)
               .text("Summary Report", MARGIN, doc.y + 4, {
                   width: USABLE_W, align: "center", underline: true
               });

            doc.moveDown(1);

            // ── Month/Year + Program ─────────────────────────────
            doc.font("Helvetica-Bold").fontSize(10)
               .text(`Month & Year: ${summaryData.month}, ${summaryData.year}`, MARGIN, doc.y);

            if (summaryData.courseName) {
                doc.font("Helvetica-Bold").fontSize(10)
                   .text(`Program Name: ${summaryData.courseName}`, MARGIN, doc.y + 4);
            }

            doc.moveDown(1);

            // ── Column header row ────────────────────────────────
            const headerY = doc.y;
            doc.rect(MARGIN, headerY, COL_NAME_W, 20).stroke();
            doc.rect(MARGIN + COL_NAME_W, headerY, COL_AMT_W, 20).stroke();

            doc.font("Helvetica-Bold").fontSize(10)
               .text("Faculty / Semester", MARGIN + 4, headerY + 5, {
                   width: COL_NAME_W - 8
               });
            doc.font("Helvetica-Bold").fontSize(10)
               .text("Amount", MARGIN + COL_NAME_W + 4, headerY + 5, {
                   width: COL_AMT_W - 8, align: "right"
               });

            let currentY = headerY + 20;

            // ── Semester groups ──────────────────────────────────
            for (const sem of summaryData.semesters) {
                // Check page overflow
                if (currentY + 22 > 750) {
                    doc.addPage();
                    currentY = 50;
                }

                // Semester row (bold, no amount in right col)
                doc.rect(MARGIN, currentY, COL_NAME_W + COL_AMT_W, 20).stroke();
                doc.font("Helvetica-Bold").fontSize(10)
                   .text(`Semester ${sem.semester_number}`, MARGIN + 4, currentY + 5, {
                       width: COL_NAME_W + COL_AMT_W - 8
                   });
                currentY += 20;

                // Faculty rows
                for (const fac of sem.faculties) {
                    if (currentY + 18 > 750) {
                        doc.addPage();
                        currentY = 50;
                    }

                    doc.rect(MARGIN, currentY, COL_NAME_W, 18).stroke();
                    doc.rect(MARGIN + COL_NAME_W, currentY, COL_AMT_W, 18).stroke();

                    doc.font("Helvetica").fontSize(10)
                       .text(fac.faculty_name, MARGIN + 4, currentY + 4, {
                           width: COL_NAME_W - 8
                       });
                    doc.font("Helvetica").fontSize(10)
                       .text(String(fac.total_amount), MARGIN + COL_NAME_W + 4, currentY + 4, {
                           width: COL_AMT_W - 8, align: "right"
                       });
                    currentY += 18;
                }
            }

            // ── Grand Total row ──────────────────────────────────
            if (currentY + 22 > 750) {
                doc.addPage();
                currentY = 50;
            }

            doc.moveTo(MARGIN, currentY).lineTo(MARGIN + USABLE_W, currentY).stroke();
            currentY += 8;

            doc.rect(MARGIN, currentY, COL_NAME_W, 22).stroke();
            doc.rect(MARGIN + COL_NAME_W, currentY, COL_AMT_W, 22).stroke();

            doc.font("Helvetica-Bold").fontSize(11)
               .text("Total", MARGIN + 4, currentY + 5, {
                   width: COL_NAME_W - 8, align: "center"
               });
            doc.font("Helvetica-Bold").fontSize(11)
               .text(String(summaryData.grandTotal), MARGIN + COL_NAME_W + 4, currentY + 5, {
                   width: COL_AMT_W - 8, align: "right"
               });
            currentY += 22;

            // ── Footer — Program In-charge ───────────────────────
            currentY += 40;
            if (summaryData.course && summaryData.course.program_incharge) {
                doc.font("Helvetica-Bold").fontSize(10)
                   .text(summaryData.course.program_incharge, MARGIN, currentY);
                currentY += 16;
                doc.font("Helvetica-Bold").fontSize(10)
                   .text("Program In-charge", MARGIN, currentY);
                currentY += 14;
                doc.font("Helvetica-Bold").fontSize(10)
                   .text(summaryData.courseName || "", MARGIN, currentY);
            }

            doc.end();

        } catch (err) {
            reject(err);
        }
    });
};

// =================================================================
// Download Summary PDF
// PATCH /api/monthly-summary/download?month=&year=&courseId=
// =================================================================
const downloadMonthlySummaryPDF = async (month, year, courseId) => {
    const summaryData = await getMonthlySummary(month, year, courseId);
    if (summaryData.semesters.length === 0) {
        throw new Error("No bill data found for this month/year/course combination.");
    }
    const pdfPath = await generateSummaryPDF(summaryData);
    return pdfPath;
};

module.exports = {
    getMonthlySummary,
    getAllCoursesMonthlySummary,
    downloadMonthlySummaryPDF
};
