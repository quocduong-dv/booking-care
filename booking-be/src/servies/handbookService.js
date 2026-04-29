const { reject } = require("lodash")
import db from "../models/index";
import { Op } from 'sequelize';
let getHandBook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.name || !data.imageBase64 ||
                !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Handbook.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                    tags: data.tags || null,
                    category: data.category || null
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

let getAllHandBook = (opts = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { q, tag, category, limit } = opts || {};
            const where = {};
            if (q) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${q}%` } },
                    { tags: { [Op.like]: `%${q}%` } }
                ];
            }
            if (tag) where.tags = { [Op.like]: `%${tag}%` };
            if (category) where.category = category;

            let data = await db.Handbook.findAll({
                where,
                order: [['id', 'DESC']],
                limit: limit ? Math.min(parseInt(limit, 10), 100) : undefined
            });
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer.from(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errMessage: 'ok',
                errCode: 0,
                data
            })
        } catch (e) {
            reject(e)
        }

    })
}
// let getDetailHandBookById = (inputId) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (!inputId) {
//                 resolve({
//                     errCode: 1,
//                     errMessage: 'Missing parameter'
//                 })
//             } else {
//                 let data = await db.Handbook.findOne({
//                     where: {
//                         id: inputId
//                     },
//                     attributes: ['descriptionHTML', 'descriptionMarkdown'],
//                 })
//                 // if (data) {
//                 //     let arrHandBook = [];
//                 //     arrHandBook = await db.Doctor_Infor.findAll({
//                 //         where: { clinicId: inputId },
//                 //         attributes: ['doctorId', 'provinceId'],
//                 //     })
//                 //     //do something
//                 //     data.arrHandBook = arrHandBook;

//                 // } else data = {}

//                 resolve({
//                     errMessage: 'ok',
//                     errCode: 0,
//                     data
//                 })
//             }
//         } catch (e) {
//             reject(e);
//         }
//     })
// }
let getDetailHandBookById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                });
            } else {
                let data = await db.Handbook.findOne({
                    where: { id: inputId },
                    attributes: ['descriptionHTML', 'descriptionMarkdown'],
                });

                if (data) {
                    // Nếu bạn cần sử dụng phần mã đã comment, hãy bỏ comment và chỉnh sửa như sau:
                    // let arrHandBook = await db.Doctor_Infor.findAll({
                    //     where: { clinicId: inputId },
                    //     attributes: ['doctorId', 'provinceId'],
                    // });
                    // data.arrHandBook = arrHandBook;

                    resolve({
                        errMessage: 'ok',
                        errCode: 0,
                        data
                    });
                } else {
                    resolve({
                        errMessage: 'Handbook not found',
                        errCode: 2,
                        data: {}
                    });
                }
            }
        } catch (e) {
            reject({
                errMessage: 'Internal server error',
                errCode: 500,
                error: e
            });
        }
    });
};

let editHandBook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let handbook = await db.Handbook.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (handbook) {
                    handbook.name = data.name || handbook.name;
                    handbook.descriptionHTML = data.descriptionHTML || handbook.descriptionHTML;
                    handbook.descriptionMarkdown = data.descriptionMarkdown || handbook.descriptionMarkdown;
                    if (data.imageBase64) {
                        handbook.image = data.imageBase64;
                    }
                    if (Object.prototype.hasOwnProperty.call(data, 'tags')) {
                        handbook.tags = data.tags || null;
                    }
                    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
                        handbook.category = data.category || null;
                    }
                    await handbook.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update handbook succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Handbook not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteHandBook = (handbookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!handbookId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let handbook = await db.Handbook.findOne({
                    where: { id: handbookId }
                })
                if (handbook) {
                    await db.Handbook.destroy({
                        where: { id: handbookId }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'Delete handbook succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Handbook not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getHandBook: getHandBook,
    getAllHandBook: getAllHandBook,
    getDetailHandBookById: getDetailHandBookById,
    editHandBook: editHandBook,
    deleteHandBook: deleteHandBook
}