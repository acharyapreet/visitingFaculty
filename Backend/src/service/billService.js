const {
    sequelize,
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

const generateBill = async (facultyId, month, year) => {

    if (!facultyId || !month || !year) {
        throw new Error("Missing required fields");
    }

    let transaction;

    try {

        transaction = await sequelize.transaction();

        // ==========================
        // Check Duplicate Bill
        // ==========================
        const existingBill = await Bill.findOne({
            where: {
                user_id: facultyId,
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
                user_id: facultyId,
                month,
                year
            },

            include: [
                {
                    model: Allocation,
                    include: [
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

            user_id: facultyId,

            month,

            year,

            total_hours: totalHours,

            total_amount: totalAmount,

            amount_in_words: amountInWords,

            bill_date: new Date(),

            pdf_path: null

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

module.exports = {
    generateBill
};