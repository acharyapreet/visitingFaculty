const User = require("../Schema/userSchema");

const activateUser = async (userId,role) => {
    const user = await User.findOne({
        where:{
            user_id :userId,
            role: role
        }
    });

    if(!user){
        throw new Error(`${role} not found.`);
    }
    await user.update({
        is_active:true
    });
    return user;
}

const deactivateUser = async (userId,role) => {
    const user = await User.findOne({
        where:{
         user_id:userId,
         role:role
        }
    });
    if(!user){
        throw new Error(`${role} not found.`);
    }
    await user.update({
        is_active: false
    });
    return user;
};

module.exports ={
    activateUser,
    deactivateUser
};