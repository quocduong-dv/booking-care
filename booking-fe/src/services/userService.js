import axios from '../axios'
const sendOtpRegister = (data) => {
    return axios.post('/api/register-client-send-otp', data);
}
const verifyOtpRegister = (data) => {
    return axios.post('/api/verify-otp-register', data);
}
const handleLoginApi = (email, password) => {
    return axios.post('/api/login', { email, password });
}
const forgotPasswordService = (email) => {
    return axios.post('/api/forgot-password', { email });
}
const resetPasswordService = (data) => {
    return axios.post('/api/reset-password', data);
}
const getAllUsers = (inputId, roleId = 'ALL') => { // write api
    return axios.get(`/api/get-all-users?id=${inputId}&roleId=${roleId}`)
}
const createNewUserService = (data) => {
    console.log('check data from service :', data)
    return axios.post('/api/create-new-user', data)
}
const deleteUserService = (userId) => {
    // return axios.delete('/api/delete-user', { id: userId })
    return axios.delete('/api/delete-user', {
        data: {
            id: userId
        }
    });
}
const editUserService = (inputData) => {
    return axios.put('/api/edit-user', inputData);
}
const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`)
}
const getTopDoctorHomeService = (limit) => {
    return axios.get(`/api/top-doctor-home?limit=${limit}`)
}
const getAllDoctors = () => {
    return axios.get(`/api/get-all-doctor`)
}
const saveDetailDoctorService = (data) => {
    return axios.post('/api/save-infor-doctor', data)
}
const getDetailInforDoctor = (inputId) => {
    return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`)
}
const saveBulkScheduleDoctor = (data) => {
    return axios.post('/api/bulk-create-schedule', data)
}
const getScheduleDoctorByDate = (doctorId, date) => {
    return axios.get(`/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`)
}
const getExtraInforDoctorById = (doctorId) => {
    return axios.get(`/api/get-extra-infor-doctor-by-id?doctorId=${doctorId}`)
}
const getProfileDoctorById = (doctorId) => {
    return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`)
}
const postPatientBookingAppointment = (data) => {
    return axios.post('/api/patient-book-appointment', data)
}
const postVerifyBookAppointment = (data) => {
    return axios.post('/api/verify-book-appointment', data)
}
const createPaymentUrlService = (data) => {
    return axios.post('/api/create-payment-url', data)
}
const getPaymentHistoryService = (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return axios.get(`/api/get-payment-history${q ? `?${q}` : ''}`)
}
const markPaymentRefundedService = (paymentId) => {
    return axios.post('/api/mark-payment-refunded', { paymentId })
}
const verifyVnpayReturnService = (queryString) => {
    return axios.get(`/api/vnpay-return${queryString}`)
}
const getQueueByDoctorService = (doctorId, date) => {
    return axios.get(`/api/get-queue-by-doctor?doctorId=${doctorId}${date ? `&date=${date}` : ''}`)
}
const assignQueueNumbersService = (data) => {
    return axios.post('/api/assign-queue-numbers', data)
}
const callNextPatientService = (data) => {
    return axios.post('/api/call-next-patient', data)
}
const getPatientQueueStatusService = (bookingId) => {
    return axios.get(`/api/get-patient-queue-status?bookingId=${bookingId}`)
}
const createReviewService = (data) => {
    return axios.post('/api/create-review', data)
}
const getReviewsByDoctorService = (doctorId, limit = 10, offset = 0) => {
    return axios.get(`/api/get-reviews-by-doctor?doctorId=${doctorId}&limit=${limit}&offset=${offset}`)
}
const getReviewByBookingService = (bookingId) => {
    return axios.get(`/api/get-review-by-booking?bookingId=${bookingId}`)
}
const sendMessageService = (data) => {
    return axios.post('/api/send-message', data)
}
const getMessagesService = (bookingId, userId) => {
    return axios.get(`/api/get-messages?bookingId=${bookingId}${userId ? `&userId=${userId}` : ''}`)
}
const getUnreadByDoctorService = (doctorId) => {
    return axios.get(`/api/get-unread-by-doctor?doctorId=${doctorId}`)
}
const getPatientBookingsService = (patientId) => {
    return axios.get(`/api/get-patient-bookings?patientId=${patientId}`)
}
const getPatientBookingDetailService = (bookingId, patientId) => {
    return axios.get(`/api/get-patient-booking-detail?bookingId=${bookingId}&patientId=${patientId}`)
}
const createNewSpecialty = (data) => {
    return axios.post('/api/create-new-specialty', data)
}
const editSpecialty = (data) => {
    return axios.put('/api/edit-specialty', data)
}
const deleteSpecialty = (specialtyId) => {
    return axios.delete('/api/delete-specialty', {
        data: { id: specialtyId }
    })
}
const getAllSpecialty = () => {
    return axios.get('/api/get-all-specialty')
}
const getAllClinic = () => {
    return axios.get('/api/get-clinic')
}
const getDetailSpecialtyById = (data) => {
    return axios.get(`/api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}`)
}
const getDetailClinicById = (data) => {
    return axios.get(`/api/get-detail-clinic-by-id?id=${data.id}`)
}
const createNewClinic = (data) => {
    return axios.post('/api/create-new-clinic', data)
}
const editClinic = (data) => {
    return axios.put('/api/edit-clinic', data)
}
const deleteClinic = (clinicId) => {
    return axios.delete('/api/delete-clinic', {
        data: { id: clinicId }
    })
}

const getAllPatientForDoctor = (data) => {
    return axios.get(`/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${data.date}`)
}
const postSendRemedy = (data) => {
    return axios.post('/api/send-remedy', data)
}
// api handbook
const getCreateHandBook = (data) => {
    return axios.post('/api/create-new-handbook', data)
}
const editHandBook = (data) => {
    return axios.put('/api/edit-handbook', data)
}
const deleteHandBook = (handbookId) => {
    return axios.delete('/api/delete-handbook', {
        data: { id: handbookId }
    })
}
const getAllHandBook = (opts) => {
    if (!opts) return axios.get('/api/get-handbook');
    const p = [];
    if (opts.q) p.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts.tag) p.push(`tag=${encodeURIComponent(opts.tag)}`);
    if (opts.category) p.push(`category=${encodeURIComponent(opts.category)}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    return axios.get(`/api/get-handbook${p.length ? '?' + p.join('&') : ''}`);
}
const getDetailHandBookById = (data) => {
    return axios.get(`/api/get-detail-handbook-by-id?id=${data.id}`)
}
const getDashboardCounts = () => {
    return axios.get('/api/get-dashboard-counts');
}

// Dashboard advanced APIs
const getDashboardStats = (data) => {
    return axios.get(`/api/get-dashboard-stats?period=${data.period}&startDate=${data.startDate}&endDate=${data.endDate}`)
}
const getSpecialtyStats = () => {
    return axios.get('/api/get-specialty-stats')
}
const getMonthlyAppointmentStats = (year) => {
    return axios.get(`/api/get-monthly-appointment-stats?year=${year}`)
}

// Doctor revenue APIs
const getDoctorRevenue = (data) => {
    return axios.get(`/api/get-doctor-revenue?doctorId=${data.doctorId}&period=${data.period}&startDate=${data.startDate}&endDate=${data.endDate}`)
}
const getAllDoctorRevenueSummary = (data) => {
    return axios.get(`/api/get-all-doctor-revenue-summary?period=${data.period}&startDate=${data.startDate}&endDate=${data.endDate}`)
}

// Appointment management APIs (Admin)
const getAllAppointments = (data) => {
    const p = [];
    if (data.date) p.push(`date=${encodeURIComponent(data.date)}`);
    if (data.doctorId) p.push(`doctorId=${data.doctorId}`);
    if (data.statusId) p.push(`statusId=${data.statusId}`);
    if (data.q) p.push(`q=${encodeURIComponent(data.q)}`);
    if (data.dateFrom) p.push(`dateFrom=${data.dateFrom}`);
    if (data.dateTo) p.push(`dateTo=${data.dateTo}`);
    if (data.paymentStatus) p.push(`paymentStatus=${data.paymentStatus}`);
    return axios.get(`/api/get-all-appointments${p.length ? '?' + p.join('&') : ''}`);
}
const updateAppointmentStatus = (data) => {
    return axios.put('/api/update-appointment-status', data)
}

// Follow-up appointment APIs
const getAllFollowUpAppointments = (data) => {
    return axios.get(`/api/get-follow-up-appointments?date=${data.date}&doctorId=${data.doctorId}`)
}
const createFollowUpAppointment = (data) => {
    return axios.post('/api/create-follow-up-appointment', data)
}
const sendFollowUpReminder = (data) => {
    return axios.post('/api/send-follow-up-reminder', data)
}
const doctorCreateAppointmentService = (data) => {
    return axios.post('/api/doctor-create-appointment', data)
}

// Prescription APIs
const getAllPrescriptions = (data) => {
    return axios.get(`/api/get-all-prescriptions?doctorId=${data.doctorId}&patientId=${data.patientId}&date=${data.date}`)
}
const createPrescription = (data) => {
    return axios.post('/api/create-prescription', data)
}
const getPrescriptionDetail = (prescriptionId) => {
    return axios.get(`/api/get-prescription-detail?id=${prescriptionId}`)
}
const deletePrescription = (prescriptionId) => {
    return axios.delete('/api/delete-prescription', { data: { id: prescriptionId } })
}
const getPatientPrescriptionHistory = (patientId) => {
    return axios.get(`/api/get-patient-prescription-history?patientId=${patientId}`)
}
const sendPrescriptionEmail = (data) => {
    return axios.post('/api/send-prescription-email', data)
}

// Doctor Leave APIs
const getAllDoctorLeaves = (data) => {
    return axios.get(`/api/get-all-doctor-leaves?doctorId=${data.doctorId}&status=${data.status}&month=${data.month}&year=${data.year}`)
}
const createDoctorLeave = (data) => {
    return axios.post('/api/create-doctor-leave', data)
}
const approveDoctorLeave = (data) => {
    return axios.put('/api/approve-doctor-leave', data)
}
const rejectDoctorLeave = (data) => {
    return axios.put('/api/reject-doctor-leave', data)
}
const deleteDoctorLeave = (leaveId) => {
    return axios.delete('/api/delete-doctor-leave', { data: { id: leaveId } })
}

// Doctor Work Schedule APIs
const getDoctorWorkSchedule = (data) => {
    return axios.get(`/api/get-doctor-work-schedule?doctorId=${data.doctorId}&weekStart=${data.weekStart}`)
}
const saveDoctorWorkSchedule = (data) => {
    return axios.post('/api/save-doctor-work-schedule', data)
}
const deleteDoctorWorkSchedule = (scheduleId) => {
    return axios.delete('/api/delete-doctor-work-schedule', { data: { id: scheduleId } })
}

// EMR (ho so benh an)
const saveEmrService = (data) => {
    return axios.post('/api/save-emr', data);
}
const getEmrByBookingService = (bookingId) => {
    return axios.get(`/api/get-emr-by-booking?bookingId=${bookingId}`);
}
const getPatientEmrHistoryService = (patientId) => {
    return axios.get(`/api/get-patient-emr-history?patientId=${patientId}`);
}

// Notifications
const getNotificationsService = (opts = {}) => {
    const params = [];
    if (opts.limit) params.push(`limit=${opts.limit}`);
    if (opts.unreadOnly) params.push(`unreadOnly=1`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return axios.get(`/api/get-notifications${qs}`);
}
const markNotificationReadService = (id) => {
    return axios.put('/api/mark-notification-read', { id });
}
const markAllNotificationsReadService = () => {
    return axios.put('/api/mark-all-notifications-read', {});
}
const deleteNotificationService = (id) => {
    return axios.delete('/api/delete-notification', { data: { id } });
}

// Medicines
const getMedicinesService = (opts = {}) => {
    const p = [];
    if (opts.q) p.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    if (opts.activeOnly) p.push(`activeOnly=1`);
    return axios.get(`/api/get-medicines${p.length ? '?' + p.join('&') : ''}`);
};
const createMedicineService = (data) => axios.post('/api/create-medicine', data);
const updateMedicineService = (data) => axios.put('/api/edit-medicine', data);
const deleteMedicineService = (id) => axios.delete('/api/delete-medicine', { data: { id } });
const adjustMedicineStockService = (data) => axios.put('/api/adjust-medicine-stock', data);
const getStockMovementsService = (opts = {}) => {
    const p = [];
    if (opts.medicineId) p.push(`medicineId=${opts.medicineId}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    return axios.get(`/api/get-stock-movements${p.length ? '?' + p.join('&') : ''}`);
};

// Review moderation
const getAllReviewsService = (opts = {}) => {
    const p = [];
    if (opts.status) p.push(`status=${opts.status}`);
    if (opts.doctorId) p.push(`doctorId=${opts.doctorId}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    if (opts.offset) p.push(`offset=${opts.offset}`);
    return axios.get(`/api/get-all-reviews${p.length ? '?' + p.join('&') : ''}`);
};
const moderateReviewService = (data) => axios.put('/api/moderate-review', data);

// Service packages (goi kham)
const getServicePackagesService = (opts = {}) => {
    const p = [];
    if (opts.featured) p.push('featured=1');
    if (opts.specialtyId) p.push(`specialtyId=${opts.specialtyId}`);
    if (opts.clinicId) p.push(`clinicId=${opts.clinicId}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    return axios.get(`/api/get-service-packages${p.length ? '?' + p.join('&') : ''}`);
};
const getServicePackageDetailService = (idOrSlug) =>
    axios.get(`/api/get-service-package-detail?id=${encodeURIComponent(idOrSlug)}`);

// Loyalty
const getLoyaltyPointsService = () => axios.get('/api/get-loyalty-points');

// Search suggest (typeahead)
const searchSuggestService = (q) =>
    axios.get(`/api/search-suggest?q=${encodeURIComponent(q || '')}`);

// Doctor search
const searchDoctorsService = (opts = {}) => {
    const p = [];
    Object.entries(opts).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) p.push(`${k}=${encodeURIComponent(v)}`);
    });
    return axios.get(`/api/search-doctors${p.length ? '?' + p.join('&') : ''}`);
};

// Voucher
const validateVoucherService = (code, amount) => axios.post('/api/validate-voucher', { code, amount });
const getVouchersService = (opts = {}) => {
    const q = opts.activeOnly ? '?activeOnly=1' : '';
    return axios.get(`/api/get-vouchers${q}`);
};
const createVoucherService = (data) => axios.post('/api/create-voucher', data);
const updateVoucherService = (data) => axios.put('/api/edit-voucher', data);
const deleteVoucherService = (id) => axios.delete('/api/delete-voucher', { data: { id } });

// Lab results
const createLabResultService = (data) => axios.post('/api/create-lab-result', data);
const getLabResultsByPatientService = (patientId) =>
    axios.get(`/api/get-lab-results-by-patient${patientId ? `?patientId=${patientId}` : ''}`);
const getLabResultsByBookingService = (bookingId) =>
    axios.get(`/api/get-lab-results-by-booking?bookingId=${bookingId}`);
const deleteLabResultService = (id) =>
    axios.delete('/api/delete-lab-result', { data: { id } });

// Waitlist
const addToWaitlistService = (data) => axios.post('/api/add-to-waitlist', data);
const getMyWaitlistService = () => axios.get('/api/get-my-waitlist');
const getWaitlistsByDoctorService = (opts = {}) => {
    const p = [];
    if (opts.doctorId) p.push(`doctorId=${opts.doctorId}`);
    if (opts.status) p.push(`status=${opts.status}`);
    return axios.get(`/api/get-waitlists-by-doctor${p.length ? '?' + p.join('&') : ''}`);
};
const removeFromWaitlistService = (id) =>
    axios.delete('/api/remove-from-waitlist', { data: { id } });

// Medicine batches
const addMedicineBatchService = (data) => axios.post('/api/add-medicine-batch', data);
const getMedicineBatchesService = (medicineId) =>
    axios.get(`/api/get-medicine-batches?medicineId=${medicineId}`);
const deleteMedicineBatchService = (id) =>
    axios.delete('/api/delete-medicine-batch', { data: { id } });
const getExpiringMedicinesService = (days = 30) =>
    axios.get(`/api/get-expiring-medicines?days=${days}`);

// No-show
const markNoShowService = (data) => axios.put('/api/mark-no-show', data);
const getNoShowStatsService = (opts = {}) => {
    const p = [];
    if (opts.period) p.push(`period=${opts.period}`);
    if (opts.startDate) p.push(`startDate=${opts.startDate}`);
    if (opts.endDate) p.push(`endDate=${opts.endDate}`);
    return axios.get(`/api/get-no-show-stats${p.length ? '?' + p.join('&') : ''}`);
};

// Doctor review reply
const replyReviewService = (data) => axios.put('/api/reply-review', data);

// Queue kiosk
const getKioskQueueService = (doctorId, date) =>
    axios.get(`/api/get-kiosk-queue?doctorId=${doctorId}${date ? `&date=${date}` : ''}`);

// Audit log
const getAuditLogsService = (opts = {}) => {
    const p = [];
    if (opts.action) p.push(`action=${encodeURIComponent(opts.action)}`);
    if (opts.userId) p.push(`userId=${opts.userId}`);
    if (opts.from) p.push(`from=${opts.from}`);
    if (opts.to) p.push(`to=${opts.to}`);
    if (opts.limit) p.push(`limit=${opts.limit}`);
    return axios.get(`/api/get-audit-logs${p.length ? '?' + p.join('&') : ''}`);
};

export {
    handleLoginApi,
    forgotPasswordService,
    resetPasswordService,
    getAllUsers,
    createNewUserService,
    deleteUserService,
    editUserService,
    getAllCodeService,
    getTopDoctorHomeService,
    getAllDoctors,
    saveDetailDoctorService,
    getDetailInforDoctor,
    saveBulkScheduleDoctor,
    getScheduleDoctorByDate,
    getExtraInforDoctorById,
    getProfileDoctorById,
    postPatientBookingAppointment,
    postVerifyBookAppointment,
    createNewSpecialty, editSpecialty, deleteSpecialty,
    getAllSpecialty, getDetailSpecialtyById,
    createNewClinic, editClinic, deleteClinic, getAllClinic,
    getDetailClinicById, getAllPatientForDoctor, postSendRemedy,
    getCreateHandBook, editHandBook, deleteHandBook, getAllHandBook, getDetailHandBookById,
    getDashboardCounts, getDashboardStats, getSpecialtyStats, getMonthlyAppointmentStats,
    getDoctorRevenue, getAllDoctorRevenueSummary,
    sendOtpRegister,
    verifyOtpRegister,
    getAllAppointments, updateAppointmentStatus,
    getAllFollowUpAppointments, createFollowUpAppointment, sendFollowUpReminder,
    doctorCreateAppointmentService,
    getAllPrescriptions, createPrescription, getPrescriptionDetail, deletePrescription, getPatientPrescriptionHistory,
    sendPrescriptionEmail,
    getAllDoctorLeaves, createDoctorLeave, approveDoctorLeave, rejectDoctorLeave, deleteDoctorLeave,
    getDoctorWorkSchedule, saveDoctorWorkSchedule, deleteDoctorWorkSchedule,
    createPaymentUrlService, getPaymentHistoryService, markPaymentRefundedService, verifyVnpayReturnService,
    getQueueByDoctorService, assignQueueNumbersService, callNextPatientService, getPatientQueueStatusService,
    createReviewService, getReviewsByDoctorService, getReviewByBookingService,
    sendMessageService, getMessagesService, getUnreadByDoctorService,
    getPatientBookingsService, getPatientBookingDetailService,
    saveEmrService, getEmrByBookingService, getPatientEmrHistoryService,
    getNotificationsService, markNotificationReadService,
    markAllNotificationsReadService, deleteNotificationService,
    getMedicinesService, createMedicineService, updateMedicineService,
    deleteMedicineService, adjustMedicineStockService, getStockMovementsService,
    getAuditLogsService,
    validateVoucherService, getVouchersService,
    createVoucherService, updateVoucherService, deleteVoucherService,
    getAllReviewsService, moderateReviewService,
    getServicePackagesService, getServicePackageDetailService,
    getLoyaltyPointsService, searchDoctorsService, searchSuggestService,
    createLabResultService, getLabResultsByPatientService,
    getLabResultsByBookingService, deleteLabResultService,
    addToWaitlistService, getMyWaitlistService,
    getWaitlistsByDoctorService, removeFromWaitlistService,
    addMedicineBatchService, getMedicineBatchesService,
    deleteMedicineBatchService, getExpiringMedicinesService,
    markNoShowService, getNoShowStatsService,
    replyReviewService, getKioskQueueService
};