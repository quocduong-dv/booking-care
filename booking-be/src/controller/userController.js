import userService from "../servies/userService";
import loyaltyService from "../servies/loyaltyService";

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
        })
    }
    //check email exist
    //compare password
    // return userInfor
    //access_token:JWT json web 
    let userData = await userService.handleUserLogin(email, password);
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {},
        token: userData.token || null,
        requireMfa: userData.requireMfa || false,
        mfaUserId: userData.mfaUserId || null,
        mfaEmail: userData.mfaEmail || null
    })
}

let handleVerifyMfaOtp = async (req, res) => {
    try {
        const { userId, code } = req.body || {};
        const result = await userService.verifyMfaOtp({ userId, code });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

let handleResendMfaOtp = async (req, res) => {
    try {
        const { userId } = req.body || {};
        const result = await userService.resendMfaOtp({ userId });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};
let handleGetAllUsers = async (req, res) => {
    let id = req.query.id; // ALL, id
    let roleId = req.query.roleId;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters',
            users: []
        })
    }
    let users = await userService.getAllUsers(id, roleId);

    return res.status(200).json({
        errCode: 0,
        errMessage: 'ok',
        users
    })
}
let handleCreateNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);

    return res.status(200).json(message);
}
let handleDeleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters!"
        })
    }
    let message = await userService.deleteUser(req.body.id);

    return res.status(200).json(message);
}
let handleEditUser = async (req, res) => {
    let data = req.body; // lấy đc tất cả các input đặt name 
    let message = await userService.updateUserData(data);
    return res.status(200).json(message)
}
let getAllCode = async (req, res) => {
    try {
        setTimeout(async () => { // load dữ liệu nếu reset trang 
            let data = await userService.getAllCodeService(req.query.type);
            return res.status(200).json(data);
        }, 3000)


    } catch (e) {
        console.log('Get all code error:', e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })

    }
}
let handleSendOtp = async (req, res) => {
    try {
        let message = await userService.sendOtpService(req.body);
        return res.status(200).json(message);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let handleVerifyOtp = async (req, res) => {
    try {
        let message = await userService.verifyOtpService(req.body);
        return res.status(200).json(message);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};
        const result = await userService.requestPasswordReset({ email });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

let handleGetLoyaltyPoints = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Unauthorized' });
        const r = await loyaltyService.getPointsForUser(userId);
        return res.status(200).json(r);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

let handleResetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body || {};
        const result = await userService.resetPasswordWithOtp({ email, code, newPassword });
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({ errCode: -1, errMessage: 'Error from server' });
    }
};

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode,
    handleSendOtp: handleSendOtp,
    handleVerifyOtp: handleVerifyOtp,
    handleVerifyMfaOtp,
    handleResendMfaOtp,
    handleForgotPassword,
    handleResetPassword,
    handleGetLoyaltyPoints
}