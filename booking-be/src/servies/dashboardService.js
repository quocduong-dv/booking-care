import db from "../models/index";
require('dotenv').config();


let getWeeklyRevenue = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Get last 7 days
            let days = [];
            for (let i = 6; i >= 0; i--) {
                let d = new Date();
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() - i);
                days.push(d.getTime());
            }


            let bookings = await db.Booking.findAll({
                where: { statusId: 'S3' },
                include: [
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['id', 'firstName', 'lastName'],
                        include: [
                            {
                                model: db.Doctor_Infor,
                                attributes: ['priceId'],
                                include: [
                                    { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi'] }
                                ]
                            }
                        ]
                    }
                ],
                raw: true,
                nest: true
            });

            // Map standard day timestamps
            let dataRevenue = days.map(day => {
                let revenue = 0;
                let nextDay = day + 24 * 60 * 60 * 1000;


                let dayBookings = bookings.filter(b => {
                    let bDate = parseInt(b.date);
                    return bDate >= day && bDate < nextDay;
                });

                dayBookings.forEach(b => {
                    if (b.doctorData && b.doctorData.Doctor_Infor && b.doctorData.Doctor_Infor.priceTypeData) {
                        revenue += parseInt(b.doctorData.Doctor_Infor.priceTypeData.valueVi);
                    }
                });

                return {
                    date: day,
                    revenue: revenue
                };
            });

            resolve(dataRevenue);

        } catch (e) {
            reject(e);
        }
    });
}

let getTopThreeDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let bookings = await db.Booking.findAll({
                where: { statusId: 'S3' },
                include: [
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['id', 'firstName', 'lastName', 'image'],
                        include: [
                            {
                                model: db.Doctor_Infor,
                                attributes: ['priceId'],
                                include: [
                                    { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi'] }
                                ]
                            }
                        ]
                    }
                ],
                raw: true,
                nest: true
            });

            let doctorMap = {};

            bookings.forEach(b => {
                if (b.doctorData) {
                    let docId = b.doctorId;
                    if (!doctorMap[docId]) {
                        doctorMap[docId] = {
                            doctorData: b.doctorData,
                            revenue: 0,
                            count: 0
                        }
                    }
                    if (b.doctorData.Doctor_Infor && b.doctorData.Doctor_Infor.priceTypeData) {
                        doctorMap[docId].revenue += parseInt(b.doctorData.Doctor_Infor.priceTypeData.valueVi);
                    }
                    doctorMap[docId].count++;
                }
            });

            let sorted = Object.values(doctorMap).sort((a, b) => b.revenue - a.revenue);
            let top3 = sorted.slice(0, 3);

            resolve(top3);

        } catch (e) {
            reject(e);
        }
    });
}

// Update getDashboardCounts to include these
let getDashboardCounts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let totalDoctors = await db.User.count({ where: { roleId: 'R2' } });
            let totalPatients = await db.User.count({ where: { roleId: 'R3' } });
            let totalAppointments = await db.Booking.count({ where: { statusId: 'S3' } });

            // New users today
            let startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            let newUsers = await db.User.count({
                where: {
                    createdAt: {
                        [db.Sequelize.Op.gte]: startOfDay
                    },
                    roleId: 'R3'
                }
            });

            let weeklyRevenue = await getWeeklyRevenue();
            let topDoctors = await getTopThreeDoctors();

            resolve({
                totalDoctors,
                totalPatients,
                totalAppointments,
                newUsers,
                weeklyRevenue,
                topDoctors
            });
        } catch (e) {
            reject(e);
        }
    });
};

// #12 - Số lượt khám theo chuyên khoa (PieChart)
let getSpecialtyStats = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let bookings = await db.Booking.findAll({
                where: { statusId: 'S3' },
                attributes: ['doctorId'],
                raw: true
            });

            let doctorIds = [...new Set(bookings.map(b => b.doctorId))];

            let doctorInfos = await db.Doctor_Infor.findAll({
                where: { doctorId: doctorIds },
                attributes: ['doctorId', 'specialtyId'],
                include: [
                    {
                        model: db.Specialty,
                        attributes: ['name']
                    }
                ],
                raw: true,
                nest: true
            });

            let doctorSpecialtyMap = {};
            doctorInfos.forEach(d => {
                doctorSpecialtyMap[d.doctorId] = d.Specialty ? d.Specialty.name : 'Khác';
            });

            let specialtyCount = {};
            bookings.forEach(b => {
                let name = doctorSpecialtyMap[b.doctorId] || 'Khác';
                specialtyCount[name] = (specialtyCount[name] || 0) + 1;
            });

            let data = Object.keys(specialtyCount).map(name => ({
                name: name,
                count: specialtyCount[name]
            }));

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: data
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #13 - Lượt khám theo tháng (BarChart)
let getMonthlyAppointmentStats = (year) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!year) year = new Date().getFullYear();

            let bookings = await db.Booking.findAll({
                attributes: ['date', 'statusId'],
                raw: true
            });

            let monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            let data = monthNames.map((name, index) => ({
                month: name,
                total: 0,
                done: 0,
                cancelled: 0
            }));

            bookings.forEach(b => {
                let bookingDate = new Date(parseInt(b.date));
                if (bookingDate.getFullYear() === parseInt(year)) {
                    let monthIndex = bookingDate.getMonth();
                    data[monthIndex].total++;
                    if (b.statusId === 'S3') data[monthIndex].done++;
                    if (b.statusId === 'S4') data[monthIndex].cancelled++;
                }
            });

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: data
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #14 - Thống kê nâng cao
let getDashboardStats = (period, startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = {};

            if (startDate && endDate) {
                whereClause.date = {
                    [db.Sequelize.Op.gte]: startDate,
                    [db.Sequelize.Op.lte]: endDate
                };
            } else if (period === 'today') {
                let today = new Date();
                today.setHours(0, 0, 0, 0);
                let todayTimestamp = today.getTime().toString();
                whereClause.date = todayTimestamp;
            }

            let allBookings = await db.Booking.findAll({
                where: whereClause,
                attributes: ['statusId'],
                raw: true
            });

            let total = allBookings.length;
            let todayPatients = allBookings.filter(b => b.statusId === 'S3').length;
            let cancelled = allBookings.filter(b => b.statusId === 'S4').length;
            let cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;

            let confirmed = allBookings.filter(b => b.statusId === 'S2').length;
            let pending = allBookings.filter(b => b.statusId === 'S1').length;

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: {
                    todayPatients,
                    cancelRate,
                    total,
                    confirmed,
                    pending,
                    cancelled
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #15 - Doanh thu chi tiết 1 bác sĩ
let getDoctorRevenue = (doctorId, period, startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter: doctorId'
                })
                return;
            }

            let whereClause = { doctorId: doctorId, statusId: 'S3' };

            if (startDate && endDate) {
                whereClause.date = {
                    [db.Sequelize.Op.gte]: startDate,
                    [db.Sequelize.Op.lte]: endDate
                };
            }

            let bookings = await db.Booking.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.User, as: 'patientData',
                        attributes: ['firstName']
                    }
                ],
                raw: true,
                nest: true
            });

            let doctorInfor = await db.Doctor_Infor.findOne({
                where: { doctorId: doctorId },
                attributes: ['priceId'],
                include: [
                    { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi'] }
                ],
                raw: true,
                nest: true
            });

            let pricePerVisit = 0;
            if (doctorInfor && doctorInfor.priceTypeData) {
                pricePerVisit = parseInt(doctorInfor.priceTypeData.valueVi) || 0;
            }

            let data = bookings.map(b => ({
                date: b.date,
                patientName: b.patientData ? b.patientData.firstName : '',
                serviceName: '',
                amount: pricePerVisit
            }));

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: {
                    data: data,
                    totalRevenue: pricePerVisit * bookings.length,
                    totalAppointments: bookings.length
                }
            })
        } catch (e) {
            reject(e);
        }
    })
}

// #16 - Bảng tổng doanh thu tất cả BS
let getAllDoctorRevenueSummary = (period, startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            let whereClause = { statusId: 'S3' };

            if (startDate && endDate) {
                whereClause.date = {
                    [db.Sequelize.Op.gte]: startDate,
                    [db.Sequelize.Op.lte]: endDate
                };
            }

            let bookings = await db.Booking.findAll({
                where: whereClause,
                include: [
                    {
                        model: db.User, as: 'doctorData',
                        attributes: ['id', 'firstName', 'lastName'],
                        include: [
                            {
                                model: db.Doctor_Infor,
                                attributes: ['priceId'],
                                include: [
                                    { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi'] }
                                ]
                            }
                        ]
                    }
                ],
                raw: true,
                nest: true
            });

            let doctorMap = {};
            bookings.forEach(b => {
                if (b.doctorData) {
                    let docId = b.doctorId;
                    if (!doctorMap[docId]) {
                        doctorMap[docId] = {
                            doctorName: `${b.doctorData.lastName || ''} ${b.doctorData.firstName || ''}`.trim(),
                            appointmentCount: 0,
                            revenue: 0
                        };
                    }
                    doctorMap[docId].appointmentCount++;
                    if (b.doctorData.Doctor_Infor && b.doctorData.Doctor_Infor.priceTypeData) {
                        doctorMap[docId].revenue += parseInt(b.doctorData.Doctor_Infor.priceTypeData.valueVi) || 0;
                    }
                }
            });

            let data = Object.values(doctorMap);

            resolve({
                errCode: 0,
                errMessage: 'ok',
                data: { data: data }
            })
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    getDashboardCounts,
    getSpecialtyStats,
    getMonthlyAppointmentStats,
    getDashboardStats,
    getDoctorRevenue,
    getAllDoctorRevenueSummary
}
