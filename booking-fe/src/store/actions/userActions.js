import actionTypes from './actionTypes';
import { setAuthToken } from '../../axios';

export const addUserSuccess = () => ({
    type: actionTypes.ADD_USER_SUCCESS
})
export const userLoginSuccess = (userInfo) => ({
    type: actionTypes.USER_LOGIN_SUCCESS,
    userInfo: userInfo
})
export const userLoginFail = () => ({
    type: actionTypes.USER_LOGIN_FAIL
})
export const processLogout = () => {
    setAuthToken(null);
    return { type: actionTypes.PROCESS_LOGOUT };
}