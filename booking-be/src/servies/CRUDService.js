import bcrypt from 'bcryptjs';
import db from '../models/index';
const salt = bcrypt.genSaltSync(10);


let createNewUser = async (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            let handPasswordFromBcrypt = await handUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: handPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phoneNumber: data.phoneNumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,

            })
            resolve('ok create a new user succeed')
        } catch (e) {
            reject(e);
        }
    })



}
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

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {

        try {
            let users = db.User.findAll({
                raw: true,
            });
            resolve(users)

        } catch (e) {
            reject(e);
        }
    })
}
let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Sử dụng Sequelize để tìm một bản ghi trong bảng User
            let user = await db.User.findOne({
                where: { id: userId },
                raw: true,
            })
            if (user) { // check điều kiện . nếu có trả ra user
                resolve(user)
            } else { ///\ ngược lại trả về mảng rỗng
                resolve([])
            }
        } catch (e) {
            // Nếu có lỗi, từ chối Promise với lỗi tương ứng
            reject(e);
        }
    })
}
let updateUserData = (data) => {
    // update vào data csdl
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({ // 1. tìm người dùng trong csdl
                where: { id: data.id }  // điều kiện where id= id người dùng truyền vào 
            })
            if (user) {  // sau khi tìm đc user . bắt đầu cập nhật thong tin các use theo biến data
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                await user.save();
                let allUsers = await db.User.findAll();
                resolve(allUsers);
            } else {
                resolve();
            }
            // await db.User.Update({


        } catch (e) {
            console.log(e);
        }
    })
}
let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if (user) {
                user.destroy();

            }
            resolve(); // return 
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,

    deleteUserById: deleteUserById,
}