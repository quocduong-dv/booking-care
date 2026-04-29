import dashboardService from "../servies/dashboardService";
import revenuePdfService from "../servies/revenuePdfService";

let getDashboardCounts = async (req, res) => {
    try {
        let data = await dashboardService.getDashboardCounts();
        return res.status(200).json({
            errCode: 0,
            errMessage: 'OK',
            data: data
        })
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// #12
let getSpecialtyStats = async (req, res) => {
    try {
        let data = await dashboardService.getSpecialtyStats();
        return res.status(200).json(data)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// #13
let getMonthlyAppointmentStats = async (req, res) => {
    try {
        let data = await dashboardService.getMonthlyAppointmentStats(req.query.year);
        return res.status(200).json(data)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// #14
let getDashboardStats = async (req, res) => {
    try {
        let data = await dashboardService.getDashboardStats(
            req.query.period, req.query.startDate, req.query.endDate
        );
        return res.status(200).json(data)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// #15
let getDoctorRevenue = async (req, res) => {
    try {
        let data = await dashboardService.getDoctorRevenue(
            req.query.doctorId, req.query.period, req.query.startDate, req.query.endDate
        );
        return res.status(200).json(data)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// #16
let getAllDoctorRevenueSummary = async (req, res) => {
    try {
        let data = await dashboardService.getAllDoctorRevenueSummary(
            req.query.period, req.query.startDate, req.query.endDate
        );
        return res.status(200).json(data)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let downloadRevenuePdf = async (req, res) => {
    try {
        await revenuePdfService.streamRevenuePdf({
            period: req.query.period || 'month',
            startDate: req.query.startDate,
            endDate: req.query.endDate
        }, res);
    } catch (e) {
        console.log(e);
        if (!res.headersSent) res.status(500).send('PDF error');
    }
};

module.exports = {
    getDashboardCounts,
    getSpecialtyStats,
    getMonthlyAppointmentStats,
    getDashboardStats,
    getDoctorRevenue,
    getAllDoctorRevenueSummary,
    downloadRevenuePdf
}
