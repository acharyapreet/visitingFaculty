const {
    activateUser,
    deactivateUser
} = require("../service/accountStatusService");

const activateFacultyController = async (req, res) => {
    try{
        const { id} = req.params;

        const user = await activateUser(id,"faculty");

        return res.status(200).json({
            success: true,
            message: "Faculty activate succefully",
            data:user
        });

    } catch (error) {
        return res.status(500).json({
          success:false,
          message:error.message
        });
    }
};

const deactivateFacultyController = async (req, res) => {
    try{
        const { id} = req.params;

        const user = await deactivateUser(id,"faculty");

        return res.status(200).json({
            success:true,
            message: "Faculty deactivate succefully.",
            data: user
        });

    } catch (error){
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

const activateAdminController = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await activateUser(id,"admin");

        return res.status(200).json({
            success:true,
            message:"Admin activate succefully.",
            data: user
        });

    } catch (error){
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
};

const deactivateAdminController = async (req, res) =>{
    try{
        const { id } = req.params;
        const user = await deactivateUser(id,"admin");

        return res.status(200).json({
            success:true,
            message: "Admin deactivated successfully",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

module.exports ={
    activateFacultyController,
    deactivateFacultyController,
    activateAdminController,
    deactivateAdminController
};