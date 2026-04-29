const { reject } = require("lodash")
import db from "../models/index";
let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.name || !data.imageBase64 ||
                !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                    type: data.type
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
let getAllSpecialty = (inputType) => {
    return new Promise(async (resolve, reject) => {
        try {
            let config = {};
            if (inputType) {
                config.where = { type: inputType }
            }
            let data = await db.Specialty.findAll(config);
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
let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: inputId },
                    attributes: ['id', 'name', 'descriptionHTML', 'descriptionMarkdown', 'image', 'type'],
                    raw: true
                })
                let data = {};
                if (specialty) {
                    let doctorSpecialty = [];
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { specialtyId: inputId },
                            attributes: ['doctorId', 'provinceId'],
                            raw: true
                        })
                    } else {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId'],
                            raw: true
                        })
                    }
                    data = { ...specialty, doctorSpecialty };
                }
                resolve({
                    errMessage: 'ok',
                    errCode: 0,
                    data
                })


            }

        } catch (e) {
            reject(e)
        }

    })
}
let editSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (specialty) {
                    specialty.name = data.name || specialty.name;
                    specialty.descriptionHTML = data.descriptionHTML || specialty.descriptionHTML;
                    specialty.descriptionMarkdown = data.descriptionMarkdown || specialty.descriptionMarkdown;
                    specialty.type = data.type || specialty.type;
                    if (data.imageBase64) {
                        specialty.image = data.imageBase64;
                    }
                    await specialty.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update specialty succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Specialty not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteSpecialty = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!specialtyId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: specialtyId }
                })
                if (specialty) {
                    await db.Specialty.destroy({
                        where: { id: specialtyId }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'Delete specialty succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Specialty not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    editSpecialty: editSpecialty,
    deleteSpecialty: deleteSpecialty
}