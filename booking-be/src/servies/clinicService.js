const { reject } = require("lodash")
import db from "../models/index";


let createClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.name || !data.imageBase64 || !data.address ||
                !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
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
let getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({

            });
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer.from(item.image, 'base64').toString('binary');
                    // item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errMessage: 'ok',
                errCode: 0,
                data
            })
        } catch (e) {
            reject(e);
        }
    })
}
let getDetailClinicById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['name', 'address', 'descriptionHTML', 'descriptionMarkdown'],
                })
                if (data) {
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: { clinicId: inputId },
                        attributes: ['doctorId', 'provinceId'],
                    })
                    //do something
                    data.doctorClinic = doctorClinic;

                } else data = {}

                resolve({
                    errMessage: 'ok',
                    errCode: 0,
                    data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let editClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let clinic = await db.Clinic.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (clinic) {
                    clinic.name = data.name || clinic.name;
                    clinic.address = data.address || clinic.address;
                    clinic.descriptionHTML = data.descriptionHTML || clinic.descriptionHTML;
                    clinic.descriptionMarkdown = data.descriptionMarkdown || clinic.descriptionMarkdown;
                    if (data.imageBase64) {
                        clinic.image = data.imageBase64;
                    }
                    await clinic.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update clinic succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Clinic not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteClinic = (clinicId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!clinicId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: id'
                })
            } else {
                let clinic = await db.Clinic.findOne({
                    where: { id: clinicId }
                })
                if (clinic) {
                    await db.Clinic.destroy({
                        where: { id: clinicId }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'Delete clinic succeed!'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Clinic not found!'
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    editClinic: editClinic,
    deleteClinic: deleteClinic
}