const {
    generateBill,
    getBillDetails,
    getBillHistory,
    getAllBills,
    deleteBill,
    downloadBill
} = require("../service/billService");
const generateBillController = async (req, res) => {

    try {

        const { facultyId, month, year } = req.body;

        if (
    facultyId === undefined ||
    month === undefined ||
    year === undefined
) {
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

const getBillDetailsController = async (req,res) => {
   try{
    const { billId} = req.params;

    const bill = await getBillDetails(billId);

    return res.status(200).json({
    success: true,
    data: bill
});
   } catch(error) {
    return res.status(500).json({
      success:false,
      message:error.message
    });
   }
};

//Get History

const getBillHistoryController = async (req,res) => {
    try{
        const { facultyId } = req.params;

        const bills = await getBillHistory(facultyId);

        return res.status(200).json({
            success:true,
            count:bills.length,
            data:bills
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};
const getAllBillsController = async (req,res) =>{
    try  {
        const bills = await getAllBills();

        return res.status(200).json({
            success:true,
            count:bills.length,
            data:bills
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};
const deleteBillController = async (req, res) => {
    try{
        const {billId} = req.params;

        const result = await deleteBill(billId);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

// ==========================================
// Download Bill
// ==========================================

const downloadBillController = async (req, res) => {

    try {

        const { billId } = req.params;

        const pdfPath = await downloadBill(billId);

        return res.download(pdfPath);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
module.exports = {
    generateBillController,
    getBillDetailsController,
    getBillHistoryController,
    getAllBillsController,
    deleteBillController,
    downloadBillController
};