import db from "../models/index";
require('dotenv').config();
import _, { includes, reject } from 'lodash';
import emailService from '../servies/emailService';
import { Op } from 'sequelize';
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}
let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                }
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

// Search doctors with filters: specialtyId, clinicId, minRating, maxPrice, q (name), sort
let searchDoctors = async (opts = {}) => {
    try {
        const { specialtyId, clinicId, q, sort, limit, offset, maxPriceId, minRating } = opts;
        const userWhere = { roleId: 'R2' };
        if (q) {
            const like = `%${q}%`;
            userWhere[Op.or] = [
                { firstName: { [Op.like]: like } },
                { lastName: { [Op.like]: like } },
                db.sequelize.where(
                    db.sequelize.fn('CONCAT',
                        db.sequelize.col('User.lastName'), ' ',
                        db.sequelize.col('User.firstName')),
                    { [Op.like]: like }
                ),
                { '$Doctor_Infor.specialtyData.name$': { [Op.like]: like } },
                { '$Doctor_Infor.clinicData.name$': { [Op.like]: like } }
            ];
        }
        const inforWhere = {};
        if (specialtyId) inforWhere.specialtyId = specialtyId;
        if (clinicId) inforWhere.clinicId = clinicId;
        if (maxPriceId) inforWhere.priceId = { [Op.lte]: maxPriceId };

        const doctors = await db.User.findAll({
            where: userWhere,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Doctor_Infor,
                    where: Object.keys(inforWhere).length ? inforWhere : undefined,
                    required: !!(specialtyId || clinicId || maxPriceId),
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Specialty, as: 'specialtyData', attributes: ['id', 'name'] },
                        { model: db.Clinic, as: 'clinicData', attributes: ['id', 'name'] }
                    ]
                },
                { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }
            ],
            limit: Math.min(parseInt(limit, 10) || 30, 100),
            offset: parseInt(offset, 10) || 0,
            subQuery: false,
            raw: false,
            nest: true
        });

        // Attach avgRating per doctor.
        const doctorIds = doctors.map(d => d.id);
        let ratingMap = {};
        if (doctorIds.length) {
            const ratings = await db.Review.findAll({
                where: { doctorId: { [Op.in]: doctorIds }, isApproved: true },
                attributes: [
                    'doctorId',
                    [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'avg'],
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['doctorId'],
                raw: true
            });
            ratings.forEach(r => { ratingMap[r.doctorId] = { avg: Number(r.avg) || 0, count: Number(r.count) || 0 }; });
        }

        let result = doctors.map(d => {
            const plain = d.get({ plain: true });
            const r = ratingMap[plain.id] || { avg: 0, count: 0 };
            plain.avgRating = Number(r.avg.toFixed(2));
            plain.reviewCount = r.count;
            return plain;
        });

        if (minRating) {
            const m = Number(minRating);
            result = result.filter(d => d.avgRating >= m);
        }
        if (sort === 'rating') result.sort((a, b) => b.avgRating - a.avgRating);
        else if (sort === 'reviews') result.sort((a, b) => b.reviewCount - a.reviewCount);

        return { errCode: 0, data: result };
    } catch (e) {
        console.log('[searchDoctors]', e.message);
        return { errCode: -1, errMessage: 'Error from server' };
    }
};

// Strip Vietnamese diacritics + lowercase so "Hai" matches "Hải" and "tim mach" matches "Tim mạch".
const stripDiacritics = (s) => (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();

let searchSuggest = async ({ q } = {}) => {
    try {
        const keyword = (q || '').trim();
        if (!keyword) return { errCode: 0, data: [] };
        const normKw = stripDiacritics(keyword);
        const POOL = 30;

        const [specialties, clinics, doctors] = await Promise.all([
            db.Specialty.findAll({
                attributes: ['id', 'name'],
                limit: 200
            }),
            db.Clinic.findAll({
                attributes: ['id', 'name'],
                limit: 200
            }),
            db.User.findAll({
                where: { roleId: 'R2' },
                attributes: ['id', 'firstName', 'lastName'],
                include: [{
                    model: db.Doctor_Infor,
                    attributes: ['id'],
                    include: [{ model: db.Specialty, as: 'specialtyData', attributes: ['name'] }]
                }],
                limit: 500
            })
        ]);

        const matches = (text) => stripDiacritics(text).includes(normKw);

        const sp = specialties
            .filter(s => matches(s.name))
            .slice(0, POOL)
            .map(s => ({ type: 'specialty', id: s.id, name: s.name }));

        const cl = clinics
            .filter(c => matches(c.name))
            .slice(0, POOL)
            .map(c => ({ type: 'clinic', id: c.id, name: c.name }));

        const dc = doctors
            .map(d => {
                const p = d.get({ plain: true });
                const fullName = `${p.lastName || ''} ${p.firstName || ''}`.trim();
                const specialtyName = p.Doctor_Infor && p.Doctor_Infor.specialtyData
                    ? p.Doctor_Infor.specialtyData.name : '';
                return { id: p.id, fullName, specialtyName };
            })
            .filter(d => matches(d.fullName))
            .slice(0, POOL)
            .map(d => ({
                type: 'doctor',
                id: d.id,
                name: d.fullName,
                subtitle: d.specialtyName
            }));

        return { errCode: 0, data: [...sp.slice(0, 5), ...dc.slice(0, 5), ...cl.slice(0, 5)] };
    } catch (e) {
        console.log('[searchSuggest]', e.message);
        return { errCode: -1, errMessage: 'Error from server' };
    }
};

// func valid data
let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice',
        'selectedPayment', 'selectedProvince', 'nameClinic', 'addressClinic', 'note', 'specialtyId'
    ]
    let isValid = true;
    let element = '';
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid: isValid,
        element: element,
    }
}
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try { //validate data on server
            let checkObj = checkRequiredFields(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter:${checkObj.element} `
                })
            } else {

                //upsert to Markdown
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId


                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save()
                    }
                }

                //upsert to Doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,

                    },
                    raw: false
                })


                if (doctorInfor) {
                    //update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;

                    await doctorInfor.save()
                } else {
                    //create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        provinceId: inputData.selectedProvince,
                        paymentId: inputData.selectedPayment,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,

                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infro doctors succeed !'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = new Buffer.from(data.image, 'base64').toString('binary');
                    // data.image = new Buffer (data.image, 'base64').toString('binary');
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}
let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter !"
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                // save trùng thông tin 
                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.formatedDate },
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true
                    }

                );
                //convert date
                // if (existing && existing.length > 0) {
                //     existing = existing.map(item => {
                //         item.date = new Date(item.date).getTime();
                //         return item;
                //     })
                // }
                // so sanh data --> trùng data -> ko lấy
                // a='5' b=+a =>b=5 covert str -> số nguyên
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }
                //
                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}
let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },




                    ],


                    raw: false,
                    nest: true
                })
                if (!dataSchedule) dataSchedule = [];
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getExtraInforDoctorById = (idInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: idInput
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']//bỏ id và doctorId
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                    ],
                    raw: false,
                    nest: true

                })
                if (!data) data = [];
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getProfileDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },

                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },

                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = new Buffer.from(data.image, 'base64').toString('binary');
                    // data.image = new Buffer (data.image, 'base64').toString('binary');
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getListPatientForDoctor = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) { // validate data
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.User, as: 'patientData', attributes: ['email', 'firstName', 'address', 'gender'],

                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
                            ],
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                        }
                    ],
                    raw: false,
                    nest: true

                })
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let sendRemedy = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) { // validate data
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {

                // update patient status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save()
                }
                //send email remedy
                await emailService.sendAttachment(data);
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

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    searchDoctors,
    searchSuggest,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListPatientForDoctor: getListPatientForDoctor,
    sendRemedy: sendRemedy

}
