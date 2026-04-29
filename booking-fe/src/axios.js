import axios from 'axios';
import _ from 'lodash';

const TOKEN_KEY = 'bc_auth_token';

let reduxDispatch = null;
export const registerAuthDispatch = (fn) => { reduxDispatch = fn; };

export const setAuthToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
};
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    //  withCredentials: true
});

instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const isAdminSidePath = (path) => {
    return path.startsWith('/system') || path.startsWith('/doctor') || path === '/login';
};

instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            setAuthToken(null);
            if (reduxDispatch) {
                try { reduxDispatch({ type: 'PROCESS_LOGOUT' }); } catch (e) { /* ignore */ }
            }
            // React-router HOCs (userIsAuthenticated, etc.) will redirect to /login or
            // /login-client once redux state updates — no hard window.location needed.
        } else if (status === 403) {
            console.warn('[axios] 403 Forbidden:', error?.config?.url);
        }
        return Promise.reject(error);
    }
);

export default instance;
