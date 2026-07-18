const { generateBillPDF } = require("../utils/pdfGenerator");
const {
    sequelize,
    User,
    Attendance,
    Allocation,
    Course,
    Semester,
    Section,
    Subject,
    Bill,
    BillDetail
} = require("../Schema");

const { toWords } = require("number-to-words");

const resolveUserId = async (facultyId) => {
    // If facultyId looks like a numeric primary key, resolve it directly.
    if (!isNaN(facultyId)) {
        const userByPk = await User.findByPk(Number(facultyId));
        if (userByPk) return userByPk.user_id;
    }
    // Otherwise treat it as the external UVFIN identifier.
    const user = await User.findOne({ where: { uvfin: facultyId } });
    if (user) return user.user_id;
    throw new Error(`Faculty user not found for ID: ${facultyId}`);
};

// ==========================================================
// Generate Bill
// ==========================================================
// `extraDetails` is optional — pass any of these from the controller/req.body
// if you want them printed on the PDF (Department, Page No., S.No., TDS %,
// Date of Submission). If your Bill model doesn't have these columns yet,
// Sequelize just ignores the extra keys — nothing breaks either way.
//
// extraDetails = {
//   department, attendancePageNo, serialNo, tdsPercent, submissionDate
// }
const generateBill = async (facultyId, month, year, extraDetails = {}) => {

    if (!facultyId || !month || !year) {
        throw new Error("Missing required fields");
    }

    const numericUserId = await resolveUserId(facultyId);

    let transaction;

    try {

        transaction = await sequelize.transaction();

        // ==========================
        // Check Duplicate Bill
        // ==========================
        const existingBill = await Bill.findOne({
            where: {
                user_id: numericUserId,
                month,
                year
            },
            transaction
        });

        if (existingBill) {
            throw new Error("Bill already generated for this month.");
        }

        // ==========================
        // Fetch Attendance
        // ==========================
        const attendanceRecords = await Attendance.findAll({

            where: {
                user_id: numericUserId,
                month,
                year
            },

            include: [
                {
                    model: Allocation,
                    include: [
                        User,
                        Course,
                        Semester,
                        Section,
                        Subject
                    ]
                }
            ],

            transaction

        });

        if (attendanceRecords.length === 0) {
            throw new Error("No attendance found for this month.");
        }

        let totalHours = 0;
        let totalAmount = 0;

        const billDetails = [];

        // ==========================
        // Calculate Bill
        // ==========================
        for (const attendance of attendanceRecords) {

            const hours = Number(attendance.hours);

            const rate = Number(
                attendance.Allocation.rate_per_hour
            );

            const amount = hours * rate;

            totalHours += hours;
            totalAmount += amount;

            billDetails.push({

                attendance_date: attendance.attendance_date,

                course_name:
                    attendance.Allocation.Course.course_name,

                semester_number:
                    attendance.Allocation.Semester.semester_number,

                section_name:
                    attendance.Allocation.Section
                        ? attendance.Allocation.Section.section_name
                        : null,

                subject_code:
                    attendance.Allocation.Subject.subject_code,

                subject_name:
                    attendance.Allocation.Subject.subject_name,

                hours,

                rate_per_hour: rate,

                amount

            });

        }

        // ==========================
        // Amount In Words
        // ==========================
        const amountInWords =
            `${toWords(Math.round(totalAmount))} Rupees Only`;

        // ==========================
        // Create Bill
        // ==========================
        const bill = await Bill.create({

            user_id: numericUserId,

            month,
            year,

            total_hours: totalHours,

            total_amount: totalAmount,

            amount_in_words: amountInWords,

            bill_date: new Date(),

            pdf_path: null,

            // ---- Optional Annexure-IV fields (ignored by Sequelize if the
            // ---- Bill model doesn't define these columns) ----
            department: extraDetails.department,

            attendance_page_no: extraDetails.attendancePageNo,

            serial_no: extraDetails.serialNo,

            tds_percent: extraDetails.tdsPercent,

            submission_date: extraDetails.submissionDate || new Date()

        }, {
            transaction
        });

        // ==========================
        // Create Bill Details
        // ==========================
        const finalBillDetails = billDetails.map(detail => ({

            ...detail,

            bill_id: bill.bill_id

        }));

        await BillDetail.bulkCreate(
            finalBillDetails,
            {
                transaction
            }
        );

        // ==========================
        // Faculty details for the PDF header/footer
        // (address / mobile_no / uvfin / qualification / pan_card_no /
        // account_no / bank_name / ifsc_code / aadhaar_no all come straight
        // off the User row — make sure those columns are populated in the DB,
        // the PDF just prints whatever is there)
        // ==========================
        const faculty = attendanceRecords[0].Allocation.User;

        const pdfPath = await generateBillPDF(
            bill,
            finalBillDetails,
            faculty
        );

        await bill.update(
            {
                pdf_path: pdfPath
            },
            {
                transaction
            }
        );

        // ==========================
        // Commit Transaction
        // ==========================
        await transaction.commit();

        return {

            success: true,

            message: "Bill generated successfully.",

            billId: bill.bill_id,

            totalHours,

            totalAmount,

            amountInWords,

            billDetails: finalBillDetails

        };

    } catch (error) {

        if (transaction) {
            await transaction.rollback();
        }

        throw error;

    }

};

// ==========================================================
// Get Bill Details (single bill + line items)
// ==========================================================
const getBillDetails = async (billId) => {

    const bill = await Bill.findByPk(billId, {
        include: [
            {
                model: BillDetail
            }
        ]
    });

    if (!bill) {
        throw new Error("Bill Not Found");
    }

    return bill;
};

// ==========================================================
// Get Bill History (per faculty)
// ==========================================================
const getBillHistory = async (facultyId) => {

    const numericUserId = await resolveUserId(facultyId);

    const bills = await Bill.findAll({
        where: {
            user_id: numericUserId
        },
        order: [
            ["generated_at", "DESC"]
        ]
    });
    return bills;
};

// ==========================================================
// Get All Bills (admin view)
// ==========================================================
const getAllBills = async () => {
    const bills = await Bill.findAll({
        include: [
            {
                model: User,
                attributes: [
                    "user_id",
                    "full_name",
                    "email"
                ]
            }
        ],
        order: [
            ["generated_at", "DESC"]
        ]
    });
    return bills;
};

// ==========================================================
// Delete Bill
// ==========================================================
const deleteBill = async (billId) => {
    const transaction = await sequelize.transaction();
    try {
        const bill = await Bill.findByPk(billId, {
            transaction
        });
        if (!bill) {
            throw new Error("Bill not Found");
        }
        await BillDetail.destroy({
            where: {
                bill_id: billId
            },
            transaction
        });
        await Bill.destroy({
            where: {
                bill_id: billId
            },
            transaction
        });
        await transaction.commit();

        return {
            success: true,
            message: "Bill deleted Successfully."
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const path = require("path");
const fs = require("fs");

// ==========================================================
// Download Bill PDF
// ==========================================================
const downloadBill = async (billId) => {

    const bill = await Bill.findByPk(billId);

    if (!bill) {
        throw new Error("Bill not found.");
    }

    if (!bill.pdf_path) {
        throw new Error("PDF not generated.");
    }

    const resolvedPath = path.resolve(bill.pdf_path);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error("PDF file is missing on the server. Please regenerate the bill.");
    }

    return resolvedPath;
};

module.exports = {
    generateBill,
    getBillDetails,
    getBillHistory,
    getAllBills,
    deleteBill,
    downloadBill
};