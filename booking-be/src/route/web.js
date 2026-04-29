import express from "express";
import passport from "passport";
import homController from "../controller/homController";
import userController from "../controller/userController";
import doctorController from "../controller/doctorController";
import patientController from "../controller/patientController";
import specialtyController from "../controller/specialtyController";
import clinicController from "../controller/clinicController";
import handbookController from "../controller/handbookController";
import dashboardController from "../controller/dashboardController";
import appointmentController from "../controller/appointmentController";
import prescriptionController from "../controller/prescriptionController";
import doctorLeaveController from "../controller/doctorLeaveController";
import paymentController from "../controller/paymentController";
import queueController from "../controller/queueController";
import reviewController from "../controller/reviewController";
import messageController from "../controller/messageController";
import patientHistoryController from "../controller/patientHistoryController";
import reminderController from "../controller/reminderController";
import emrController from "../controller/emrController";
import notificationController from "../controller/notificationController";
import medicineController from "../controller/medicineController";
import auditLogController from "../controller/auditLogController";
import voucherController from "../controller/voucherController";
import seoController from "../controller/seoController";
import servicePackageController from "../controller/servicePackageController";
import labResultController from "../controller/labResultController";
import waitlistController from "../controller/waitlistController";
import medicineBatchController from "../controller/medicineBatchController";
import { requireAuth, requireRole } from "../middleware/authMiddleware";
import { loginLimiter, otpLimiter, writeLimiter } from "../middleware/rateLimiter";
import { auditLog } from "../middleware/auditLogger";
let router = express.Router();

let initWebRoutes = (app) => {
    // SEO
    router.get('/robots.txt', seoController.robots);
    router.get('/sitemap.xml', seoController.sitemap);

    router.get('/', homController.getHomPage);
    router.get('/about', homController.getAboutPage);


    router.get('/crud', homController.getCRUD);
    router.post('/post-crud', homController.postCRUD);
    router.get('/get-crud', homController.displayGetCRUD);
    router.get('/edit-crud', homController.getEditCRUD);
    router.post('/put-crud', homController.putCRUD);
    router.get('/delete-crud', homController.deleteCRUD);
    //client
    // Thêm vào initWebRoutes
    router.post('/api/register-client-send-otp', otpLimiter, userController.handleSendOtp);
    router.post('/api/verify-otp-register', otpLimiter, userController.handleVerifyOtp);

    // Route cho Google Auth
    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login-client' }),
        (req, res) => {
            // Chuyển hướng về FE kèm thông tin user (hoặc token)
            res.redirect(`${process.env.URL_REACT}/home?loginStatus=success&email=${req.user.email}`);
        }
    );
    //

    router.post('/api/login', loginLimiter, auditLog('user.login'), userController.handleLogin);
    router.post('/api/verify-mfa-otp', otpLimiter, auditLog('user.verifyMfa'), userController.handleVerifyMfaOtp);
    router.post('/api/resend-mfa-otp', otpLimiter, userController.handleResendMfaOtp);
    router.post('/api/forgot-password', otpLimiter, auditLog('user.forgotPassword'), userController.handleForgotPassword);
    router.post('/api/reset-password', otpLimiter, auditLog('user.resetPassword'), userController.handleResetPassword);
    router.get('/api/get-loyalty-points', requireAuth, userController.handleGetLoyaltyPoints);
    router.get('/api/get-all-users', requireRole(['R1']), userController.handleGetAllUsers);
    router.post('/api/create-new-user', requireRole(['R1']), writeLimiter, auditLog('user.create'), userController.handleCreateNewUser);
    router.put('/api/edit-user', requireRole(['R1']), writeLimiter, auditLog('user.edit'), userController.handleEditUser);
    router.delete('/api/delete-user', requireRole(['R1']), writeLimiter, auditLog('user.delete'), userController.handleDeleteUser);
    // rest api

    router.get('/api/allcode', userController.getAllCode);

    //
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-all-doctor', doctorController.getAllDoctors);
    router.get('/api/search-doctors', doctorController.searchDoctors);
    router.get('/api/search-suggest', doctorController.searchSuggest);
    router.post('/api/save-infor-doctor', requireRole(['R1', 'R2']), doctorController.postInforDoctor);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    router.post('/api/bulk-create-schedule', requireRole(['R1', 'R2']), doctorController.bulkCreateSchedule);
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);

    router.get('/api/get-list-patient-for-doctor', requireRole(['R1', 'R2']), doctorController.getListPatientForDoctor);
    router.post('/api/send-remedy', requireRole(['R1', 'R2']), doctorController.sendRemedy);

    //
    router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);

    router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    router.get('/api/get-all-specialty', specialtyController.getAllSpecialty);
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);
    router.put('/api/edit-specialty', specialtyController.editSpecialty);
    router.delete('/api/delete-specialty', specialtyController.deleteSpecialty);


    router.post('/api/create-new-clinic', clinicController.createClinic);
    router.get('/api/get-clinic', clinicController.getAllClinic);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);
    router.put('/api/edit-clinic', clinicController.editClinic);
    router.delete('/api/delete-clinic', clinicController.deleteClinic);
    // api handbook
    router.post('/api/create-new-handbook', handbookController.getHandBook);
    router.get('/api/get-handbook', handbookController.getAllHandBook);
    router.get('/api/get-detail-handbook-by-id', handbookController.getDetailHandBookById);
    router.put('/api/edit-handbook', handbookController.editHandBook);
    router.delete('/api/delete-handbook', handbookController.deleteHandBook);

    // Appointment
    router.get('/api/get-all-appointments', requireRole(['R1', 'R2']), appointmentController.getAllAppointments);
    router.put('/api/update-appointment-status', requireAuth, appointmentController.updateAppointmentStatus);
    router.get('/api/get-follow-up-appointments', requireRole(['R1', 'R2']), appointmentController.getFollowUpAppointments);
    router.post('/api/create-follow-up-appointment', requireRole(['R1', 'R2']), appointmentController.createFollowUpAppointment);
    router.post('/api/send-follow-up-reminder', requireRole(['R1', 'R2']), appointmentController.sendFollowUpReminder);
    router.post('/api/doctor-create-appointment', requireRole(['R1', 'R2']), appointmentController.doctorCreateAppointment);
    router.put('/api/mark-no-show', requireRole(['R1', 'R2']), auditLog('booking.noShow'), appointmentController.markNoShow);
    router.get('/api/get-no-show-stats', requireRole(['R1']), appointmentController.getNoShowStats);

    // Dashboard
    router.get('/api/get-dashboard-counts', requireRole(['R1']), dashboardController.getDashboardCounts);
    router.get('/api/get-specialty-stats', requireRole(['R1']), dashboardController.getSpecialtyStats);
    router.get('/api/get-monthly-appointment-stats', requireRole(['R1']), dashboardController.getMonthlyAppointmentStats);
    router.get('/api/get-dashboard-stats', requireRole(['R1']), dashboardController.getDashboardStats);
    router.get('/api/get-doctor-revenue', requireRole(['R1', 'R2']), dashboardController.getDoctorRevenue);
    router.get('/api/get-all-doctor-revenue-summary', requireRole(['R1']), dashboardController.getAllDoctorRevenueSummary);
    router.get('/api/download-revenue-pdf', requireRole(['R1']), dashboardController.downloadRevenuePdf);

    // Prescription
    router.get('/api/get-all-prescriptions', requireRole(['R1', 'R2']), prescriptionController.getAllPrescriptions);
    router.post('/api/create-prescription', requireRole(['R1', 'R2']), prescriptionController.createPrescription);
    router.get('/api/get-prescription-detail', requireAuth, prescriptionController.getPrescriptionDetail);
    router.delete('/api/delete-prescription', requireRole(['R1', 'R2']), prescriptionController.deletePrescription);
    router.get('/api/get-patient-prescription-history', requireAuth, prescriptionController.getPatientPrescriptionHistory);
    router.post('/api/send-prescription-email', requireRole(['R1', 'R2']), prescriptionController.sendPrescriptionEmail);
    router.get('/api/download-prescription-pdf', requireAuth, prescriptionController.downloadPrescriptionPdf);

    // Doctor leaves & work schedule
    router.get('/api/get-all-doctor-leaves', requireRole(['R1', 'R2']), doctorLeaveController.getAllDoctorLeaves);
    router.post('/api/create-doctor-leave', requireRole(['R1', 'R2']), doctorLeaveController.createDoctorLeave);
    router.put('/api/approve-doctor-leave', requireRole(['R1']), doctorLeaveController.approveDoctorLeave);
    router.put('/api/reject-doctor-leave', requireRole(['R1']), doctorLeaveController.rejectDoctorLeave);
    router.delete('/api/delete-doctor-leave', requireRole(['R1', 'R2']), doctorLeaveController.deleteDoctorLeave);
    router.get('/api/get-doctor-work-schedule', requireRole(['R1', 'R2']), doctorLeaveController.getDoctorWorkSchedule);
    router.post('/api/save-doctor-work-schedule', requireRole(['R1', 'R2']), doctorLeaveController.saveDoctorWorkSchedule);
    router.delete('/api/delete-doctor-work-schedule', requireRole(['R1', 'R2']), doctorLeaveController.deleteDoctorWorkSchedule);

    // Payment (VNPay) — callbacks remain public (VNPay server calls them)
    router.post('/api/create-payment-url', requireAuth, paymentController.createPaymentUrl);
    router.get('/api/vnpay-return', paymentController.vnpayReturn);
    router.get('/api/vnpay-ipn', paymentController.vnpayIpn);
    router.get('/api/get-payment-history', requireRole(['R1']), paymentController.getPaymentHistory);
    router.post('/api/mark-payment-refunded', requireRole(['R1']), auditLog('payment.refund'), paymentController.markRefunded);

    // Queue (realtime) — patient status stays public for shareable link
    router.get('/api/get-queue-by-doctor', requireRole(['R1', 'R2']), queueController.getQueueByDoctor);
    router.post('/api/assign-queue-numbers', requireRole(['R1', 'R2']), queueController.assignQueueNumbers);
    router.post('/api/call-next-patient', requireRole(['R2']), queueController.callNextPatient);
    router.get('/api/get-patient-queue-status', queueController.getPatientQueueStatus);
    router.get('/api/get-kiosk-queue', queueController.getKioskQueue);

    // Review / Rating
    router.post('/api/create-review', requireAuth, reviewController.createReview);
    router.get('/api/get-reviews-by-doctor', reviewController.getReviewsByDoctor);
    router.get('/api/get-review-by-booking', reviewController.getReviewByBooking);
    router.get('/api/get-all-reviews', requireRole(['R1']), reviewController.listAllReviews);
    router.put('/api/moderate-review', requireRole(['R1']), auditLog('review.moderate'), reviewController.moderateReview);
    router.put('/api/reply-review', requireRole(['R2']), auditLog('review.reply'), reviewController.replyReview);

    // Chat
    router.post('/api/send-message', requireAuth, messageController.sendMessage);
    router.get('/api/get-messages', requireAuth, messageController.getMessages);
    router.get('/api/get-unread-by-doctor', requireRole(['R2']), messageController.getUnreadByDoctor);

    // Patient history
    router.get('/api/get-patient-bookings', requireAuth, patientHistoryController.getPatientBookings);
    router.get('/api/get-patient-booking-detail', requireAuth, patientHistoryController.getPatientBookingDetail);

    // Reminder (admin manual trigger for testing)
    router.post('/api/trigger-patient-reminders', requireRole(['R1']), reminderController.triggerPatientReminders);

    // EMR (ho so benh an)
    router.post('/api/save-emr', requireRole(['R1', 'R2']), emrController.saveEmr);
    router.get('/api/get-emr-by-booking', requireAuth, emrController.getEmrByBookingId);
    router.get('/api/get-patient-emr-history', requireAuth, emrController.getPatientEmrHistory);

    // Notifications
    router.get('/api/get-notifications', requireAuth, notificationController.getNotifications);
    router.put('/api/mark-notification-read', requireAuth, notificationController.markAsRead);
    router.put('/api/mark-all-notifications-read', requireAuth, notificationController.markAllRead);
    router.delete('/api/delete-notification', requireAuth, notificationController.deleteNotification);

    // Audit log (R1 only)
    router.get('/api/get-audit-logs', requireRole(['R1']), auditLogController.getAuditLogs);

    // Service packages (goi kham)
    router.get('/api/get-service-packages', servicePackageController.listPublic);
    router.get('/api/get-service-package-detail', servicePackageController.getDetail);
    router.get('/api/admin-get-service-packages', requireRole(['R1']), servicePackageController.listAdmin);
    router.post('/api/create-service-package', requireRole(['R1']), auditLog('package.create'), servicePackageController.create);
    router.put('/api/edit-service-package', requireRole(['R1']), auditLog('package.edit'), servicePackageController.update);
    router.delete('/api/delete-service-package', requireRole(['R1']), auditLog('package.delete'), servicePackageController.remove);

    // Voucher / coupon
    router.post('/api/validate-voucher', voucherController.validate);
    router.get('/api/get-vouchers', requireRole(['R1']), voucherController.list);
    router.post('/api/create-voucher', requireRole(['R1']), auditLog('voucher.create'), voucherController.create);
    router.put('/api/edit-voucher', requireRole(['R1']), auditLog('voucher.edit'), voucherController.update);
    router.delete('/api/delete-voucher', requireRole(['R1']), auditLog('voucher.delete'), voucherController.remove);

    // Medicines (R1/R2 read, R1 write)
    router.get('/api/get-medicines', requireRole(['R1', 'R2']), medicineController.getMedicines);
    router.post('/api/create-medicine', requireRole(['R1']), medicineController.createMedicine);
    router.put('/api/edit-medicine', requireRole(['R1']), medicineController.updateMedicine);
    router.delete('/api/delete-medicine', requireRole(['R1']), medicineController.deleteMedicine);
    router.put('/api/adjust-medicine-stock', requireRole(['R1', 'R2']), medicineController.adjustStock);
    router.get('/api/get-stock-movements', requireRole(['R1']), medicineController.getStockMovements);

    // Medicine batches (expiry + lot tracking)
    router.post('/api/add-medicine-batch', requireRole(['R1']), auditLog('medicine.addBatch'), medicineBatchController.addBatch);
    router.get('/api/get-medicine-batches', requireRole(['R1', 'R2']), medicineBatchController.getBatchesByMedicine);
    router.delete('/api/delete-medicine-batch', requireRole(['R1']), auditLog('medicine.deleteBatch'), medicineBatchController.deleteBatch);
    router.get('/api/get-expiring-medicines', requireRole(['R1', 'R2']), medicineBatchController.getExpiringSoon);

    // Lab results
    router.post('/api/create-lab-result', requireRole(['R1', 'R2']), auditLog('lab.create'), labResultController.createLabResult);
    router.get('/api/get-lab-results-by-patient', requireAuth, labResultController.getLabResultsByPatient);
    router.get('/api/get-lab-results-by-booking', requireAuth, labResultController.getLabResultsByBooking);
    router.delete('/api/delete-lab-result', requireRole(['R1', 'R2']), auditLog('lab.delete'), labResultController.deleteLabResult);

    // Waitlist
    router.post('/api/add-to-waitlist', requireAuth, waitlistController.addToWaitlist);
    router.get('/api/get-my-waitlist', requireAuth, waitlistController.getMyWaitlist);
    router.get('/api/get-waitlists-by-doctor', requireRole(['R1', 'R2']), waitlistController.getWaitlistsByDoctor);
    router.delete('/api/remove-from-waitlist', requireAuth, waitlistController.removeFromWaitlist);

    return app.use("/", router);
}
module.exports = initWebRoutes;