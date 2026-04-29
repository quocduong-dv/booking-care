import actionTypes from './actionTypes';
import {
    getAllCodeService, createNewUserService,
    getAllUsers, deleteUserService, editUserService,
    getTopDoctorHomeService, getAllDoctors,
    saveDetailDoctorService, getAllSpecialty, getAllClinic,
    deleteSpecialty, editSpecialty,
    deleteClinic, editClinic,
    getAllHandBook, deleteHandBook, editHandBook,
    getAllAppointments, updateAppointmentStatus,
    getAllFollowUpAppointments, sendFollowUpReminder
} from '../../services/userService';
import { toast } from "react-toastify";

// export const fetchGenderStart = () => ({
//     type: actionTypes.FETCH_GENDER_START
// })

export const fetchGenderStart = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: actionTypes.FETCH_GENDER_START
            })
            let res = await getAllCodeService("GENDER");
            if (res && res.errCode === 0) {
                dispatch(fetchGenderSuccess(res.data))
            } else {
                dispatch(fetchGenderFailed());
            }
        } catch (e) {
            dispatch(fetchGenderFailed());

            console.log('fetchGenderStart error', e)
        }
    }

}
export const fetchGenderSuccess = (genderData) => ({
    type: actionTypes.FETCH_GENDER_SUCCESS,
    data: genderData
})
export const fetchGenderFailed = () => ({
    type: actionTypes.FETCH_GENDER_FAIDED
})
//

export const fetchPositionStart = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllCodeService("POSITION");
            if (res && res.errCode === 0) {
                dispatch(fetchPositionSuccess(res.data))
            } else {
                dispatch(fetchPositionFailed());
            }
        } catch (e) {
            dispatch(fetchPositionFailed());

            console.log('fetchPositionFailed error', e)
        }
    }

}
export const fetchPositionSuccess = (positionData) => ({
    type: actionTypes.FETCH_POSITION_SUCCESS,
    data: positionData
})
export const fetchPositionFailed = () => ({
    type: actionTypes.ETCH_POSITION_FAIDED,

})
///
export const fetchRoleStart = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllCodeService("ROLE");
            if (res && res.errCode === 0) {
                dispatch(fetchRoleSuccess(res.data))
            } else {
                dispatch(fetchRoleFailed());
            }
        } catch (e) {
            dispatch(fetchRoleFailed());

            console.log('fetchRoleFailed error', e)
        }
    }
}

export const fetchRoleSuccess = (roleData) => ({
    type: actionTypes.FETCH_ROLE_SUCCESS,
    data: roleData
})
export const fetchRoleFailed = () => ({
    type: actionTypes.FETCH_ROLE_FAIlDED,

})

///
export const createNewUser = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await createNewUserService(data);

            if (res && res.errCode === 0) {
                toast.success("Create a new succeed !")
                dispatch(saveUserSuccess())
                dispatch(fetchAllUsersStart());
            } else {
                dispatch(saveUserFailed());
            }
        } catch (e) {
            dispatch(saveUserFailed());

            console.log('fetchRoleFailed error', e)
        }
    }
}
export const saveUserSuccess = () => ({
    type: actionTypes.CREATE_USER_SUCCESS
})
export const saveUserFailed = () => ({
    type: actionTypes.CREATE_USER_FAIlDED
})
///

export const fetchAllUsersStart = () => {
    return async (dispatch, getState) => {
        try {

            let res = await getAllUsers("ALL", 'R2'); // Fetch only Staff (R2)

            if (res && res.errCode === 0) {

                dispatch(fetchAllUsersSuccess(res.users.reverse()))
            } else {
                toast.error("Fetch all user error !")
                dispatch(fetchAllUsersFailed());
            }
        } catch (e) {
            toast.error("Fetch all user error !")
            dispatch(fetchAllUsersFailed());

            console.log('fetchAllUsersFailed error', e)
        }
    }
}
export const fetchAllUsersSuccess = (data) => ({
    type: actionTypes.FETCH_ALL_USER_SUCCESS,
    users: data
})
export const fetchAllUsersFailed = () => ({
    type: actionTypes.FETCH_ALL_USER_FAIlDED,

})

/// 
export const deleteUser = (userId) => {
    return async (dispatch, getState) => {
        try {
            let res = await deleteUserService(userId);

            if (res && res.errCode === 0) {
                toast.success("Delete the user succeed !")
                dispatch(deleteUserSuccess())
                dispatch(fetchAllUsersStart());
            } else {
                toast.error("Delete the user error !");
                dispatch(deleteUserFailed());
            }
        } catch (e) {
            toast.error("Delete the user error !")
            dispatch(deleteUserFailed());

            console.log('deleteUserFailed error', e)
        }
    }
}

export const deleteUserSuccess = () => ({
    type: actionTypes.DELETE_USER_SUCCESS
})
export const deleteUserFailed = () => ({
    type: actionTypes.DELETE_USER_FAIlDED
})
//
export const editAUser = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await editUserService(data);

            if (res && res.errCode === 0) {
                toast.success("Edit the user succeed !")
                dispatch(editUserSuccess())
                dispatch(fetchAllUsersStart());
            } else {
                toast.error("Edit the user error !");
                dispatch(editUserFailed());
            }
        } catch (e) {
            toast.error("Edit the user error !")
            dispatch(editUserFailed());

            console.log('editUserFailed error', e)
        }
    }
}
export const editUserSuccess = () => ({
    type: actionTypes.EDIT_USER_SUCCESS

})
export const editUserFailed = () => ({
    type: actionTypes.EDIT_USER_FAIlDED

})
//
export const fetchTopDoctor = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getTopDoctorHomeService('');
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_TOP_DOCTORS_SUCCESS,
                    dataDoctor: res.data
                })
            } else {
                dispatch({
                    type: actionTypes.FETCH_TOP_DOCTORS_FAIlDED
                })
            }
        } catch (e) {
            console.log('Check res:,', e)
            dispatch({
                type: actionTypes.FETCH_TOP_DOCTORS_FAIlDED
            })

        }
    }
}
//
export const fetchAllDoctors = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllDoctors();
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
                    dataDr: res.data
                })
            } else {
                dispatch({
                    type: actionTypes.FETCH_ALL_DOCTORS_FAIlDED
                })
            }
        } catch (e) {
            console.log('Check res:,', e)
            dispatch({
                type: actionTypes.FETCH_ALL_DOCTORS_FAIlDED
            })

        }
    }
}
//
export const saveDetailDoctor = (data) => {
    return async (dispatch, getState) => {
        try {
            let res = await saveDetailDoctorService(data);
            if (res && res.errCode === 0) {
                toast.success("Save Infor Detail  Doctor succeed !")
                dispatch({
                    type: actionTypes.SAVE_DETAIL_DOCTORS_SUCCESS,

                })
            } else {
                toast.error("Save Infor Detail  Doctor error !")
                dispatch({
                    type: actionTypes.SAVE_DETAIL_DOCTORS_FAIlDED
                })
            }
        } catch (e) {
            toast.error("Save Infor Detail  Doctor error !")
            console.log('Check res:,', e)
            dispatch({
                type: actionTypes.SAVE_DETAIL_DOCTORS_FAIlDED
            })

        }
    }
}
//
export const fetchAllScheduleTime = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllCodeService("TIME");
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_SUCCESS,
                    dataTime: res.data
                })
            } else {
                dispatch({
                    type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAIlDED
                })
            }
        } catch (e) {
            console.log('FETCH_ALLCODE_SCHEDULE_TIME_FAIlDED:', e)
            dispatch({
                type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAIlDED
            })

        }
    }
}

//doctor-ifor
export const getRequiredDoctorInfor = () => {
    return async (dispatch, getState) => {
        try {
            dispatch({
                type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_START
            })
            let resPrice = await getAllCodeService("PRICE");
            let resPayment = await getAllCodeService("PAYMENT");
            let resProvince = await getAllCodeService("PROVINCE");
            let resSpecialty = await getAllSpecialty();
            let resClinic = await getAllClinic();

            if (resPrice && resPrice.errCode === 0
                && resPayment && resPayment.errCode === 0 &&
                resProvince && resProvince.errCode === 0
                && resSpecialty && resSpecialty.errCode === 0
                && resClinic && resClinic.errCode === 0) {
                let data = {
                    resPrice: resPrice.data,
                    resPayment: resPayment.data,
                    resProvince: resProvince.data,
                    resSpecialty: resSpecialty.data,
                    resClinic: resClinic.data

                }

                dispatch(fetchRequiredDoctorInforSuccess(data))
            } else {
                dispatch(fetchRequiredDoctorInforFailed());
            }
        } catch (e) {
            dispatch(fetchRequiredDoctorInforFailed());

            console.log('fetchRequiredDoctorInforFailed error', e)
        }
    }

}
export const fetchRequiredDoctorInforSuccess = (allRequiredData) => ({
    type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_SUCCESS,
    data: allRequiredData
})
export const fetchRequiredDoctorInforFailed = () => ({
    type: actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_FAIDED
})

export const fetchAllSpecialtyStart = () => {
    return async (dispatch, getState) => {
        try {
            let res = await getAllSpecialty(); // By default fetches all without type filter
            if (res && res.errCode === 0) {
                dispatch(fetchAllSpecialtySuccess(res.data));
            } else {
                dispatch(fetchAllSpecialtyFailed());
            }
        } catch (e) {
            console.log('fetchAllSpecialtyStart error', e)
            dispatch(fetchAllSpecialtyFailed());
        }
    }
}

export const fetchAllSpecialtySuccess = (data) => ({
    type: actionTypes.FETCH_ALL_SPECIALTY_SUCCESS,
    data: data
})

export const fetchAllSpecialtyFailed = () => ({
    type: actionTypes.FETCH_ALL_SPECIALTY_FAILED
})

// Delete specialty
export const deleteASpecialty = (specialtyId) => {
    return async (dispatch) => {
        try {
            let res = await deleteSpecialty(specialtyId);
            if (res && res.errCode === 0) {
                toast.success("Xóa chuyên khoa thành công!");
                dispatch({ type: actionTypes.DELETE_SPECIALTY_SUCCESS });
                dispatch(fetchAllSpecialtyStart());
            } else {
                toast.error("Xóa chuyên khoa thất bại!");
                dispatch({ type: actionTypes.DELETE_SPECIALTY_FAILED });
            }
        } catch (e) {
            toast.error("Xóa chuyên khoa thất bại!");
            dispatch({ type: actionTypes.DELETE_SPECIALTY_FAILED });
        }
    }
}

// Edit specialty
export const editASpecialty = (data) => {
    return async (dispatch) => {
        try {
            let res = await editSpecialty(data);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật chuyên khoa thành công!");
                dispatch({ type: actionTypes.EDIT_SPECIALTY_SUCCESS });
                dispatch(fetchAllSpecialtyStart());
            } else {
                toast.error("Cập nhật chuyên khoa thất bại!");
                dispatch({ type: actionTypes.EDIT_SPECIALTY_FAILED });
            }
        } catch (e) {
            toast.error("Cập nhật chuyên khoa thất bại!");
            dispatch({ type: actionTypes.EDIT_SPECIALTY_FAILED });
        }
    }
}

// Fetch all clinics
export const fetchAllClinicsStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllClinic();
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_CLINICS_SUCCESS,
                    data: res.data
                });
            } else {
                dispatch({ type: actionTypes.FETCH_ALL_CLINICS_FAILED });
            }
        } catch (e) {
            console.log('fetchAllClinicsStart error', e);
            dispatch({ type: actionTypes.FETCH_ALL_CLINICS_FAILED });
        }
    }
}

// Delete clinic
export const deleteAClinic = (clinicId) => {
    return async (dispatch) => {
        try {
            let res = await deleteClinic(clinicId);
            if (res && res.errCode === 0) {
                toast.success("Xóa phòng khám thành công!");
                dispatch({ type: actionTypes.DELETE_CLINIC_SUCCESS });
                dispatch(fetchAllClinicsStart());
            } else {
                toast.error("Xóa phòng khám thất bại!");
                dispatch({ type: actionTypes.DELETE_CLINIC_FAILED });
            }
        } catch (e) {
            toast.error("Xóa phòng khám thất bại!");
            dispatch({ type: actionTypes.DELETE_CLINIC_FAILED });
        }
    }
}

// Edit clinic
export const editAClinic = (data) => {
    return async (dispatch) => {
        try {
            let res = await editClinic(data);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật phòng khám thành công!");
                dispatch({ type: actionTypes.EDIT_CLINIC_SUCCESS });
                dispatch(fetchAllClinicsStart());
            } else {
                toast.error("Cập nhật phòng khám thất bại!");
                dispatch({ type: actionTypes.EDIT_CLINIC_FAILED });
            }
        } catch (e) {
            toast.error("Cập nhật phòng khám thất bại!");
            dispatch({ type: actionTypes.EDIT_CLINIC_FAILED });
        }
    }
}

// Fetch all handbooks
export const fetchAllHandbooksStart = () => {
    return async (dispatch) => {
        try {
            let res = await getAllHandBook();
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_HANDBOOKS_SUCCESS,
                    data: res.data
                });
            } else {
                dispatch({ type: actionTypes.FETCH_ALL_HANDBOOKS_FAILED });
            }
        } catch (e) {
            console.log('fetchAllHandbooksStart error', e);
            dispatch({ type: actionTypes.FETCH_ALL_HANDBOOKS_FAILED });
        }
    }
}

// Delete handbook
export const deleteAHandbook = (handbookId) => {
    return async (dispatch) => {
        try {
            let res = await deleteHandBook(handbookId);
            if (res && res.errCode === 0) {
                toast.success("Xóa cẩm nang thành công!");
                dispatch({ type: actionTypes.DELETE_HANDBOOK_SUCCESS });
                dispatch(fetchAllHandbooksStart());
            } else {
                toast.error("Xóa cẩm nang thất bại!");
                dispatch({ type: actionTypes.DELETE_HANDBOOK_FAILED });
            }
        } catch (e) {
            toast.error("Xóa cẩm nang thất bại!");
            dispatch({ type: actionTypes.DELETE_HANDBOOK_FAILED });
        }
    }
}

// Edit handbook
export const editAHandbook = (data) => {
    return async (dispatch) => {
        try {
            let res = await editHandBook(data);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật cẩm nang thành công!");
                dispatch({ type: actionTypes.EDIT_HANDBOOK_SUCCESS });
                dispatch(fetchAllHandbooksStart());
            } else {
                toast.error("Cập nhật cẩm nang thất bại!");
                dispatch({ type: actionTypes.EDIT_HANDBOOK_FAILED });
            }
        } catch (e) {
            toast.error("Cập nhật cẩm nang thất bại!");
            dispatch({ type: actionTypes.EDIT_HANDBOOK_FAILED });
        }
    }
}

// ==================== APPOINTMENTS ====================

export const fetchAllAppointments = (data) => {
    return async (dispatch) => {
        try {
            let res = await getAllAppointments(data);
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_APPOINTMENTS_SUCCESS,
                    data: res.data
                });
            } else {
                dispatch({ type: actionTypes.FETCH_ALL_APPOINTMENTS_FAILED });
            }
        } catch (e) {
            console.log('fetchAllAppointments error', e);
            dispatch({ type: actionTypes.FETCH_ALL_APPOINTMENTS_FAILED });
        }
    }
}

export const updateAppointmentStatusAction = (data, filterData) => {
    return async (dispatch) => {
        try {
            let res = await updateAppointmentStatus(data);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật trạng thái lịch hẹn thành công!");
                dispatch({ type: actionTypes.UPDATE_APPOINTMENT_STATUS_SUCCESS });
                if (filterData) {
                    dispatch(fetchAllAppointments(filterData));
                }
            } else {
                toast.error("Cập nhật trạng thái thất bại!");
                dispatch({ type: actionTypes.UPDATE_APPOINTMENT_STATUS_FAILED });
            }
        } catch (e) {
            toast.error("Cập nhật trạng thái thất bại!");
            dispatch({ type: actionTypes.UPDATE_APPOINTMENT_STATUS_FAILED });
        }
    }
}

// ==================== FOLLOW-UP ====================

export const fetchAllFollowUps = (data) => {
    return async (dispatch) => {
        try {
            let res = await getAllFollowUpAppointments(data);
            if (res && res.errCode === 0) {
                dispatch({
                    type: actionTypes.FETCH_ALL_FOLLOWUP_SUCCESS,
                    data: res.data
                });
            } else {
                dispatch({ type: actionTypes.FETCH_ALL_FOLLOWUP_FAILED });
            }
        } catch (e) {
            console.log('fetchAllFollowUps error', e);
            dispatch({ type: actionTypes.FETCH_ALL_FOLLOWUP_FAILED });
        }
    }
}

export const sendFollowUpReminderAction = (data) => {
    return async (dispatch) => {
        try {
            let res = await sendFollowUpReminder(data);
            if (res && res.errCode === 0) {
                toast.success("Gửi nhắc nhở tái khám thành công!");
            } else {
                toast.error("Gửi nhắc nhở thất bại!");
            }
        } catch (e) {
            toast.error("Gửi nhắc nhở thất bại!");
        }
    }
}