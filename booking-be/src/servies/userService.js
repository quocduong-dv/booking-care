import { reject } from "lodash";
import db from "../models/index";
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import passport from "passport";
import { signToken } from '../middleware/authMiddleware';

const MFA_OTP_TTL_MS = 5 * 60 * 1000; // 5 min
const RESET_OTP_TTL_MS = 10 * 60 * 1000; // 10 min
const sendMfaOtpEmail = async (toEmail, code) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: process.env.EMAIL_APP, pass: process.env.EMAIL_APP_PASSWORD }
    });
    await transporter.sendMail({
        from: `"BookingCare" <${process.env.EMAIL_APP}>`,
        to: toEmail,
        subject: 'Ma xac thuc dang nhap BookingCare',
        html: `<p>Ma xac thuc OTP cua ban la: <b style="font-size:22px;color:#2563eb">${code}</b></p>
               <p>Ma co hieu luc trong 5 phut. Khong chia se ma voi bat ky ai.</p>`
    });
};
const sendResetOtpEmail = async (toEmail, code) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: process.env.EMAIL_APP, pass: process.env.EMAIL_APP_PASSWORD }
    });
    await transporter.sendMail({
        from: `"BookingCare" <${process.env.EMAIL_APP}>`,
        to: toEmail,
        subject: 'Ma dat lai mat khau BookingCare',
        html: `<p>Ban vua yeu cau dat lai mat khau. Ma xac thuc cua ban la:</p>
               <p><b style="font-size:22px;color:#2563eb">${code}</b></p>
               <p>Ma co hieu luc trong 10 phut. Neu ban khong yeu cau, hay bo qua email nay.</p>`
    });
};

let otpStore = {};
// otp
let sendOtpService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check email ! null
            let isExit = await checkUserEmail(data.email);
            if (isExit) {
                return resolve({
                    errCode: 1,
                    errMessage: 'Email already exits! '
                });

            }
            // create otp 6 number
            let otp = Math.floor(100000 + Math.random() * 900000);
            otpStore[data.email] = {
                otp: otp,
                userData: data,
                expired: Date.now() * 60000 // 60s
            };
            //send email
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_APP,
                    pass: process.env.EMAIL_APP_PASSWORD
                }
            });
            await transporter.sendMail({
                from: 'BookingCare <support@bookingcare.vn>',
                to: data.email,
                subject: 'Mã OTP đăng ký tài khoản ',
                html: `<h3>Mã xác thực của bạn là: <b>${otp}</b></h3><p>Mã có hiệu lực trong 60 giây.</p>`
            });
            resolve({
                errCode: 0,
                message: 'OTP sent successfully'
            });
        } catch (error) {
            reject(error);
        }
    });
};
// veryfy otp
let verifyOtpService = (data, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            let email = data.email;
            let record = otpStore[email];
            if (record && record.otp == otp && record.expired > Date.now()) {
                // opt - yes
                let hashPassword = await handUserPassword(record.userData.password);
                await db.User.create({
                    email: email,
                    password: hashPassword,
                    firstName: record.userData.firstName,
                    lastName: record.userData.lastName,
                    roleId: 'R3'
                });
                delete otpStore[email];
                resolve({
                    errCode: 0,
                    message: 'Verify OTP successfully'
                });
            } else {
                resolve({
                    errCode: 2,
                    message: 'OTP invalid or expired'
                });
            }
        } catch (e) {
            reject(e)
        }
    })


}
const salt = bcrypt.genSaltSync(10);
let handUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {

        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (e) {
            reject(e);
        }

    })
}
let handleUserLogin = (email, password) => {

    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExit = await checkUserEmail(email);
            if (isExit) {
                //user already exist
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName', 'mfaEnabled'],
                    where: { email: email },
                    raw: true

                });
                if (user) {
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password); // false
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'ok';
                        delete user.password;
                        userData.user = user;
                        userData.token = signToken({
                            id: user.id,
                            email: user.email,
                            roleId: user.roleId
                        });
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';

                    }

                } else {

                    userData.errCode = 2;
                    userData.errMessage = `User's isn't found`
                }


            } else {
                //return error
                userData.errCode = 1;
                userData.errMessage = `Your's email isn't exist in your system. Please try other email`

            }
            resolve(userData)
        } catch (e) {
            reject(e);
        }
    })
}

const verifyMfaOtp = ({ userId, code }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId || !code) return resolve({ errCode: 1, errMessage: 'Missing userId or code' });
            const user = await db.User.findOne({
                where: { id: userId },
                attributes: ['id', 'email', 'roleId', 'firstName', 'lastName', 'mfaOtpCode', 'mfaOtpExpiresAt'],
                raw: true
            });
            if (!user) return resolve({ errCode: 2, errMessage: 'User not found' });
            if (!user.mfaOtpCode || String(user.mfaOtpCode) !== String(code)) {
                return resolve({ errCode: 3, errMessage: 'OTP khong dung' });
            }
            if (!user.mfaOtpExpiresAt || new Date(user.mfaOtpExpiresAt).getTime() < Date.now()) {
                return resolve({ errCode: 4, errMessage: 'OTP da het han' });
            }
            await db.User.update(
                { mfaOtpCode: null, mfaOtpExpiresAt: null },
                { where: { id: userId } }
            );
            const safe = { ...user };
            delete safe.mfaOtpCode;
            delete safe.mfaOtpExpiresAt;
            const token = signToken({ id: user.id, email: user.email, roleId: user.roleId });
            resolve({ errCode: 0, user: safe, token });
        } catch (e) { reject(e); }
    });
};

const requestPasswordReset = ({ email }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) return resolve({ errCode: 1, errMessage: 'Vui long nhap email' });
            const user = await db.User.findOne({ where: { email }, raw: true });
            // Always return success-like message to avoid user enumeration.
            const genericOk = { errCode: 0, errMessage: 'Neu email ton tai, ma xac thuc da duoc gui.' };
            if (!user) return resolve(genericOk);
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const expiresAt = new Date(Date.now() + RESET_OTP_TTL_MS);
            await db.User.update(
                { resetOtpCode: code, resetOtpExpiresAt: expiresAt },
                { where: { id: user.id } }
            );
            try { await sendResetOtpEmail(user.email, code); }
            catch (e) { console.log('[reset] send email fail:', e.message); }
            resolve(genericOk);
        } catch (e) { reject(e); }
    });
};

const resetPasswordWithOtp = ({ email, code, newPassword }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email || !code || !newPassword) {
                return resolve({ errCode: 1, errMessage: 'Thieu thong tin' });
            }
            if (String(newPassword).length < 6) {
                return resolve({ errCode: 2, errMessage: 'Mat khau moi phai co it nhat 6 ky tu' });
            }
            const user = await db.User.findOne({
                where: { email },
                attributes: ['id', 'email', 'resetOtpCode', 'resetOtpExpiresAt'],
                raw: true
            });
            if (!user || !user.resetOtpCode) {
                return resolve({ errCode: 3, errMessage: 'Ma khong hop le' });
            }
            if (String(user.resetOtpCode) !== String(code)) {
                return resolve({ errCode: 3, errMessage: 'Ma khong hop le' });
            }
            if (!user.resetOtpExpiresAt || new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
                return resolve({ errCode: 4, errMessage: 'Ma da het han' });
            }
            const hashed = await handUserPassword(newPassword);
            await db.User.update(
                { password: hashed, resetOtpCode: null, resetOtpExpiresAt: null },
                { where: { id: user.id } }
            );
            resolve({ errCode: 0, errMessage: 'Dat lai mat khau thanh cong' });
        } catch (e) { reject(e); }
    });
};

const resendMfaOtp = ({ userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) return resolve({ errCode: 1, errMessage: 'Missing userId' });
            const user = await db.User.findOne({ where: { id: userId }, raw: true });
            if (!user) return resolve({ errCode: 2, errMessage: 'User not found' });
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const expiresAt = new Date(Date.now() + MFA_OTP_TTL_MS);
            await db.User.update({ mfaOtpCode: code, mfaOtpExpiresAt: expiresAt }, { where: { id: userId } });
            try { await sendMfaOtpEmail(user.email, code); } catch (e) { }
            resolve({ errCode: 0 });
        } catch (e) { reject(e); }
    });
};

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({ // chạy vào db và quét all trong db
                where: { email: userEmail }
            })
            // user != undfine
            if (user) { // nếu tim thấy email người dùng nhập vào == trong db => trả về kết quả
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllUsers = (userId, roleId) => {

    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                let options = {
                    attributes: { // get all but password
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'roleData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }
                    ],
                    raw: true,
                    nest: true
                }
                if (roleId && roleId !== 'ALL') {
                    options.where = { roleId: roleId }
                }

                users = await db.User.findAll(options)
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: { // get all but password
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'roleData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }
                    ],
                    raw: true,
                    nest: true

                })
            }
            resolve(users)
        } catch (e) {
            reject(e);
        }
    })
}
let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check email is exist ???
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used , Plz try other email'
                })
            } else {
                let handPasswordFromBcrypt = await handUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: handPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar,
                    insuranceNumber: data.insuranceNumber || null,
                    insuranceProvider: data.insuranceProvider || null

                })
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let foundUser = await db.User.findOne({ // if search user and have in db -> return {} or contrary to return undefined
            where: { id: userId }
        })
        if (!foundUser) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }

        await db.User.destroy({// thao tac duoi db
            where: { id: userId }
        })

        resolve({
            errCode: 0,
            errMessage: 'The user is deleted'
        })
    })
}
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }
            let user = await db.User.findOne({ // 1. tìm người dùng trong csdl
                where: { id: data.id },  // điều kiện where id= id người dùng truyền vào 
                raw: false
            })
            if (user) {  // sau khi tìm đc user . bắt đầu cập nhật thong tin các use theo biến data
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phoneNumber = data.phoneNumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }
                if (Object.prototype.hasOwnProperty.call(data, 'insuranceNumber')) {
                    user.insuranceNumber = data.insuranceNumber || null;
                }
                if (Object.prototype.hasOwnProperty.call(data, 'insuranceProvider')) {
                    user.insuranceProvider = data.insuranceProvider || null;
                }

                await user.save();

                if (Object.prototype.hasOwnProperty.call(data, 'mfaEnabled')) {
                    await db.User.update(
                        { mfaEnabled: !!data.mfaEnabled },
                        { where: { id: data.id } }
                    );
                }

                resolve({
                    errCode: 0,
                    message: 'Update the user succeeds! '
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: `User's not found!`
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters ! '
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
    sendOtpService: sendOtpService,
    verifyOtpService: verifyOtpService,
    verifyMfaOtp,
    resendMfaOtp,
    requestPasswordReset,
    resetPasswordWithOtp
}