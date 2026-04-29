import actionTypes from '../actions/actionTypes';

const initContentOfConfirmModal = {
    isOpen: false,
    messageId: "",
    handleFunc: null,
    dataFunc: null
}

const initialState = { //state cua redux
    // started: true,
    // language: 'vi',
    // systemMenuPath: '/system/user-manage',
    // contentOfConfirmModal: {
    //     ...initContentOfConfirmModal
    // }
    isLoadingGender: false,
    genders: [],
    roles: [],
    positions: [],
    users: [],
    topDoctors: [],
    allDoctors: [],
    allScheduleTime: [],

    allRequiredDoctorInfor: [],
    allSpecialties: [],
    allClinics: [],
    allHandbooks: [],
    allAppointments: [],
    allFollowUps: []
}

const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_GENDER_START:
            let copyState = { ...state };
            copyState.isLoadingGender = true;
            return {
                ...copyState,
            }
        case actionTypes.FETCH_GENDER_SUCCESS:

            state.genders = action.data;
            state.isLoadingGender = false;
            return {
                ...state,
            }
        case actionTypes.FETCH_GENDER_FAIDED:
            state.isLoadingGender = false;
            state.genders = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_POSITION_SUCCESS:
            state.positions = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_POSITION_FAIDED:
            state.positions = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_ROLE_SUCCESS:
            state.roles = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ROLE_FAIlDED:
            state.roles = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_USER_SUCCESS:
            state.users = action.users;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_USER_FAIlDED:
            state.users = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_TOP_DOCTORS_SUCCESS:
            state.topDoctors = action.dataDoctor;
            return {
                ...state,
            }
        case actionTypes.FETCH_TOP_DOCTORS_FAIlDED:
            state.topDoctors = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_DOCTORS_SUCCESS:
            state.allDoctors = action.dataDr;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_DOCTORS_FAIlDED:
            state.allDoctors = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_SUCCESS:
            state.allScheduleTime = action.dataTime;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAIlDED:
            state.allScheduleTime = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_SUCCESS:
            state.allRequiredDoctorInfor = action.data;

            return {
                ...state,
            }
        case actionTypes.FETCH_REQUIRED_DOCTOR_INFOR_FAIDED:
            state.allRequiredDoctorInfor = [];
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_SPECIALTY_SUCCESS:
            state.allSpecialties = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_SPECIALTY_FAILED:
            state.allSpecialties = [];
            return {
                ...state,
            }

        case actionTypes.FETCH_ALL_CLINICS_SUCCESS:
            state.allClinics = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_CLINICS_FAILED:
            state.allClinics = [];
            return {
                ...state,
            }

        case actionTypes.FETCH_ALL_HANDBOOKS_SUCCESS:
            state.allHandbooks = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_HANDBOOKS_FAILED:
            state.allHandbooks = [];
            return {
                ...state,
            }

        case actionTypes.FETCH_ALL_APPOINTMENTS_SUCCESS:
            state.allAppointments = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_APPOINTMENTS_FAILED:
            state.allAppointments = [];
            return {
                ...state,
            }

        case actionTypes.FETCH_ALL_FOLLOWUP_SUCCESS:
            state.allFollowUps = action.data;
            return {
                ...state,
            }
        case actionTypes.FETCH_ALL_FOLLOWUP_FAILED:
            state.allFollowUps = [];
            return {
                ...state,
            }

        default:
            return state;
    }
}

export default adminReducer;