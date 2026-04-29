import db from "../models/index";

// #22 - Danh sách nghỉ phép
let getAllDoctorLeaves = (doctorId, status, month, year) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};
            if (doctorId) whereClause.doctorId = doctorId;
            if (status) whereClause.status = status;

            let data = await db.DoctorLeave.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                raw: false
            });

            let result = data.map(item => {
                let plain = item.get({ plain: true });
                return {
                    id: plain.id,
                    doctorId: plain.doctorId,
                    doctorName: plain.doctorData
                        ? `${plain.doctorData.lastName || ''} ${plain.doctorData.firstName || ''}`.trim()
                        : '',
                    startDate: plain.startDate,
                    endDate: plain.endDate,
                    leaveType: plain.leaveType,
                    reason: plain.reason,
                    status: plain.status
                };
            });

            if (month || year) {
                result = result.filter(item => {
                    if (!item.startDate) return false;
                    let d = new Date(isNaN(item.startDate) ? item.startDate : parseInt(item.startDate));
                    if (year && d.getFullYear() !== parseInt(year)) return false;
                    if (month && (d.getMonth() + 1) !== parseInt(month)) return false;
                    return true;
                });
            }

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: result
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #23 - Tạo đơn nghỉ
let createDoctorLeave = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.startDate || !data.endDate || !data.leaveType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                await db.DoctorLeave.create({
                    doctorId: data.doctorId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    leaveType: data.leaveType,
                    reason: data.reason,
                    status: 'pending'
                });
                resolve({
                    errCode: 0,
                    errMessage: 'Create doctor leave succeed!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #24 - Duyệt đơn nghỉ
let approveDoctorLeave = (leaveId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!leaveId) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter: leaveId' })
            } else {
                let leave = await db.DoctorLeave.findOne({
                    where: { id: leaveId }, raw: false
                });
                if (leave) {
                    leave.status = 'approved';
                    await leave.save();
                    resolve({ errCode: 0, errMessage: 'Approve doctor leave succeed!' })
                } else {
                    resolve({ errCode: 2, errMessage: 'Doctor leave not found!' })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #25 - Từ chối đơn nghỉ
let rejectDoctorLeave = (leaveId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!leaveId) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter: leaveId' })
            } else {
                let leave = await db.DoctorLeave.findOne({
                    where: { id: leaveId }, raw: false
                });
                if (leave) {
                    leave.status = 'rejected';
                    await leave.save();
                    resolve({ errCode: 0, errMessage: 'Reject doctor leave succeed!' })
                } else {
                    resolve({ errCode: 2, errMessage: 'Doctor leave not found!' })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #26 - Xóa đơn nghỉ
let deleteDoctorLeave = (leaveId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!leaveId) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter: id' })
            } else {
                let leave = await db.DoctorLeave.findOne({ where: { id: leaveId } });
                if (leave) {
                    await db.DoctorLeave.destroy({ where: { id: leaveId } });
                    resolve({ errCode: 0, errMessage: 'Delete doctor leave succeed!' })
                } else {
                    resolve({ errCode: 2, errMessage: 'Doctor leave not found!' })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

// #27 - Lịch làm việc tuần + nghỉ phép
let getDoctorWorkSchedule = (doctorId, weekStart) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !weekStart) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter' });
                return;
            }

            let dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            let schedule = {};
            dayKeys.forEach(k => {
                schedule[k] = { morning: false, afternoon: false, evening: false };
            });

            let rows = await db.DoctorWorkSchedule.findAll({
                where: { doctorId: doctorId, weekStart: String(weekStart) },
                raw: true
            });

            rows.forEach(r => {
                if (schedule[r.dayOfWeek] && ['morning', 'afternoon', 'evening'].includes(r.shift)) {
                    schedule[r.dayOfWeek][r.shift] = true;
                }
            });

            let leaves = await db.DoctorLeave.findAll({
                where: { doctorId: doctorId, status: 'approved' },
                attributes: ['startDate', 'endDate'],
                raw: true
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: { schedule, leaves }
            });
        } catch (e) {
            reject(e);
        }
    })
}

// #28 - Lưu lịch làm việc tuần
let saveDoctorWorkSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.weekStart || !data.schedule) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter' });
                return;
            }

            await db.DoctorWorkSchedule.destroy({
                where: { doctorId: data.doctorId, weekStart: String(data.weekStart) }
            });

            let rows = [];
            let dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
            dayKeys.forEach(day => {
                let shifts = data.schedule[day];
                if (!shifts) return;
                ['morning', 'afternoon', 'evening'].forEach(shift => {
                    if (shifts[shift]) {
                        rows.push({
                            doctorId: data.doctorId,
                            weekStart: String(data.weekStart),
                            dayOfWeek: day,
                            shift: shift
                        });
                    }
                });
            });

            if (rows.length > 0) {
                await db.DoctorWorkSchedule.bulkCreate(rows);
            }

            resolve({ errCode: 0, errMessage: 'Save doctor work schedule succeed!' });
        } catch (e) {
            reject(e);
        }
    })
}

// #29 - Xóa 1 bản ghi lịch làm việc
let deleteDoctorWorkSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter: id' });
            } else {
                let row = await db.DoctorWorkSchedule.findOne({ where: { id: id } });
                if (row) {
                    await db.DoctorWorkSchedule.destroy({ where: { id: id } });
                    resolve({ errCode: 0, errMessage: 'Delete doctor work schedule succeed!' });
                } else {
                    resolve({ errCode: 2, errMessage: 'Work schedule not found!' });
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getAllDoctorLeaves,
    createDoctorLeave,
    approveDoctorLeave,
    rejectDoctorLeave,
    deleteDoctorLeave,
    getDoctorWorkSchedule,
    saveDoctorWorkSchedule,
    deleteDoctorWorkSchedule
}
