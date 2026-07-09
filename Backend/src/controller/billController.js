const { generateBill } = require("../service/billService");
const generateBillController = async (req, res) => {

    try {

        const { facultyId, month, year } = req.body;

        if (!facultyId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: "Faculty ID, Month and Year are required."
            });
        }

        const result = await generateBill(
            facultyId,
            month,
            year
        );

        return res.status(201).json({
            success: true,
            message: "Bill generated successfully.",
            data: result
        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    generateBillController
};