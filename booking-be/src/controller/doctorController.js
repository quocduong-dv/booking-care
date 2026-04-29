import doctorServies from "../servies/doctorServies";
let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;
    try {
        let response = await doctorServies.getTopDoctorHome(+limit);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server...'
        })
    }
}
let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorServies.getAllDoctors()
        return res.status(200).json(doctors)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}
let postInforDoctor = async (req, res) => {
    try {
        let response = await doctorServies.saveDetailInforDoctor(req.body)
        return res.status(200).json(response);
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}
let searchDoctors = async (req, res) => {
    try {
        const r = await doctorServies.searchDoctors({
            specialtyId: req.query.specialtyId,
            clinicId: req.query.clinicId,
            q: req.query.q,
            sort: req.query.sort,
            limit: req.query.limit,
            offset: req.query.offset,
            maxPriceId: req.query.maxPriceId,
            minRating: req.query.minRating
        });
        return res.status(200).json(r);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from the server' });
    }
};
let searchSuggest = async (req, res) => {
    try {
        const r = await doctorServies.searchSuggest({ q: req.query.q });
        return res.status(200).json(r);
    } catch (e) {
        return res.status(200).json({ errCode: -1, errMessage: 'Error from the server' });
    }
};
let getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorServies.getDetailDoctorById(req.query.id);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorServies.bulkCreateSchedule(req.body);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let getScheduleByDate = async (req, res) => {
    try {
        let infor = await doctorServies.getScheduleByDate(req.query.doctorId, req.query.date);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let getExtraInforDoctorById = async (req, res) => {
    try {
        let infor = await doctorServies.getExtraInforDoctorById(req.query.doctorId, req.query.date);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
//
let getProfileDoctorById = async (req, res) => {
    try {
        let infor = await doctorServies.getProfileDoctorById(req.query.doctorId, req.query.date);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let getListPatientForDoctor = async (req, res) => {
    try {
        let infor = await doctorServies.getListPatientForDoctor(req.query.doctorId, req.query.date);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let sendRemedy = async (req, res) => {
    try {
        let infor = await doctorServies.sendRemedy(req.body);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    postInforDoctor: postInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListPatientForDoctor: getListPatientForDoctor, sendRemedy,
    searchDoctors,
    searchSuggest

}