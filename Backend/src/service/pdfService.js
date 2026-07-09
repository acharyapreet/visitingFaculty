const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Columns re-sized so the table actually fits inside the A4 usable width
// (A4 = 595.28pt wide, margin = 40pt each side -> usable width ~515pt)
const COLUMNS = [
    { title: "Program", width: 75, key: "course_name" },
    { title: "Semester", width: 55, key: "semester_number" },
    { title: "Subject", width: 125, key: "subject_name" },
    { title: "Date", width: 70, key: "attendance_date" },
    { title: "Hours", width: 45, key: "hours" },
    { title: "Rate", width: 60, key: "rate_per_hour" },
    { title: "Amount", width: 70, key: "amount" }
];

const TABLE_WIDTH = COLUMNS.reduce((sum, col) => sum + col.width, 0); // ~515pt
const ROW_HEIGHT = 25;
const START_X = 40;
const PAGE_BOTTOM_LIMIT = 730; // leave room for footer before forcing a page break

const drawTableHeader = (doc, startY) => {
    let x = START_X;

    COLUMNS.forEach(column => {
        doc.rect(x, startY, column.width, ROW_HEIGHT).stroke();
        doc.text(column.title, x + 5, startY + 8, {
            width: column.width - 10,
            height: ROW_HEIGHT - 10,
            align: "center",
            ellipsis: true
        });
        x += column.width;
    });

    return startY + ROW_HEIGHT;
};

const drawAttendanceTable = (doc, billDetails) => {
    const startX = START_X;
    let currentY = doc.y + 20;

    currentY = drawTableHeader(doc, currentY);

    for (const detail of billDetails) {
        // Page break if the row (plus a little buffer) won't fit
        if (currentY + ROW_HEIGHT > PAGE_BOTTOM_LIMIT) {
            doc.addPage();
            currentY = 50;
            currentY = drawTableHeader(doc, currentY);
        }

        const row = [
            detail.course_name,
            detail.semester_number,
            detail.subject_name,
            detail.attendance_date,
            detail.hours,
            detail.rate_per_hour,
            detail.amount
        ];

        let x = startX;

        row.forEach((value, index) => {
            const column = COLUMNS[index];

            doc.rect(x, currentY, column.width, ROW_HEIGHT).stroke();
            doc.text(String(value ?? ""), x + 5, currentY + 8, {
                width: column.width - 10,
                height: ROW_HEIGHT - 10,
                align: "center",
                ellipsis: true
            });

            x += column.width;
        });

        currentY += ROW_HEIGHT;
    }

    return currentY;
};

const drawFooter = (doc, bill, faculty, startY) => {
    // If there isn't enough room left on the page for the footer block,
    // start a fresh page instead of letting it run off the bottom.
    const ESTIMATED_FOOTER_HEIGHT = 380;
    let currentY = startY + 20;

    if (currentY + ESTIMATED_FOOTER_HEIGHT > 780) {
        doc.addPage();
        currentY = 50;
    }

    // Separator
    doc.moveTo(START_X, currentY).lineTo(START_X + TABLE_WIDTH, currentY).stroke();
    currentY += 20;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text(`Total Hours : ${bill.total_hours}`, START_X, currentY);
    currentY += 20;

    doc.text(`Total Amount : \u20B9${Number(bill.total_amount).toFixed(2)}`, START_X, currentY);
    currentY += 20;

    doc.text(`Amount In Words : ${bill.amount_in_words}`, START_X, currentY);
    currentY += 30;

    doc.font("Helvetica-Bold").text("Notes:", START_X, currentY);
    currentY += 20;

    doc.font("Helvetica").fontSize(10);
    const notes = [
        "A. Rate of remuneration will be as per University rules.",
        "B. Faculty members are requested to complete all entries.",
        "C. Attendance must be verified by the authorized person.",
        "D. Fill this form separately for every month."
    ];

    notes.forEach(note => {
        doc.text(note, START_X + 10, currentY);
        currentY += 15;
    });

    currentY += 10;

    doc.font("Helvetica-Bold").fontSize(10).text("UNDERTAKING", START_X, currentY);
    currentY += 20;

    doc.font("Helvetica").fontSize(10);
    doc.text(
        "I certify that the above information is true and the total remuneration received does not exceed the University limit.",
        START_X,
        currentY,
        { width: TABLE_WIDTH, align: "justify" }
    );
    currentY += 60;

    doc.font("Helvetica-Bold");
    doc.text(`PAN : ${faculty.pan_card_no}`, START_X, currentY);
    currentY += 15;

    doc.text(`Account No : ${faculty.account_no}`, START_X, currentY);
    currentY += 15;

    doc.text(`Bank : ${faculty.bank_name}`, START_X, currentY);
    currentY += 15;

    doc.text(`IFSC : ${faculty.ifsc_code}`, START_X, currentY);
    currentY += 15;

    doc.text(`Aadhaar : ${faculty.aadhaar_no}`, START_X, currentY);
    currentY += 40;

    const signY = currentY;
    doc.font("Helvetica");
    doc.text("Faculty Signature", START_X, signY);
    doc.text("Coordinator Signature", 220, signY);
    doc.text("Director / Head", 430, signY);

    return currentY + 20;
};

const generateBillPDF = (bill, billDetails, faculty) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });

            const uploadPath = path.join(__dirname, "../uploads/bills");

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            const pdfPath = path.join(uploadPath, `bill-${bill.bill_id}.pdf`);
            const stream = fs.createWriteStream(pdfPath);

            // Only resolve once the file has actually finished writing to disk
            stream.on("finish", () => resolve(pdfPath));
            stream.on("error", reject);
            doc.on("error", reject);

            doc.pipe(stream);

            // Header
            doc.fontSize(18).text("DEVI AHILYA VISHWAVIDYALAYA", { align: "center" });
            doc.fontSize(16).text("ANNEXURE - IV", { align: "center" });
            doc.moveDown();

            // Faculty Details
            doc.fontSize(12);
            doc.text(`Name : ${faculty.full_name}`);
            doc.text(`UVFIN : ${faculty.uvfin}`);
            doc.text(`Qualification : ${faculty.qualification}`);
            doc.text(`Month : ${bill.month}`);
            doc.text(`Year : ${bill.year}`);
            doc.moveDown();

            doc.moveTo(START_X, doc.y).lineTo(START_X + TABLE_WIDTH, doc.y).stroke();

            // Attendance Table
            const tableEndY = drawAttendanceTable(doc, billDetails);

            // Footer (now actually used, with its own page-break handling)
            drawFooter(doc, bill, faculty, tableEndY);

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    generateBillPDF
};