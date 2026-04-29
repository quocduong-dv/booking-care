import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import './Login.scss';
import { FormattedMessage } from 'react-intl';
import { handleLoginApi } from '../../services/userService';
import { setAuthToken } from '../../axios';
import axios from '../../axios';
import { path } from '../../utils';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            isShowPassword: false,
            errMessage: '',
            mfaStage: false,
            mfaUserId: null,
            mfaEmail: '',
            mfaCode: '',
            mfaBusy: false
        }
    }
    handleOnchangeUsername = (event) => {
        console.log(event.target.value)
        this.setState({
            username: event.target.value
        })
    }
    handleOnchangePassword = (event) => {
        this.setState({
            password: event.target.value
        })
    }
    handleLogin = async () => {
        this.setState({ errMessage: '' });
        if (!this.state.username || !this.state.password) {
            this.setState({ errMessage: 'Vui long nhap email va mat khau' });
            return;
        }
        try {
            const data = await handleLoginApi(this.state.username, this.state.password);
            if (!data) {
                this.setState({ errMessage: 'Khong co phan hoi tu server' });
                return;
            }
            if (data.errCode !== 0) {
                this.setState({ errMessage: data.message || 'Dang nhap that bai' });
                return;
            }
            if (data.requireMfa) {
                this.setState({
                    mfaStage: true,
                    mfaUserId: data.mfaUserId,
                    mfaEmail: data.mfaEmail || this.state.username,
                    errMessage: ''
                });
                return;
            }
            const role = data.user?.roleId;
            if (role !== 'R1' && role !== 'R2') {
                this.setState({ errMessage: 'Tai khoan nay khong phai admin/bac si. Vui long dung trang dang nhap benh nhan.' });
                return;
            }
            if (data.token) setAuthToken(data.token);
            this.props.userLoginSuccess(data.user);
            // redux-auth-wrapper (userIsNotAuthenticated) redirects to /system/dashboard
            // based on roleId once isLoggedIn flips to true.
        } catch (error) {
            const serverMsg = error?.response?.data?.message;
            this.setState({ errMessage: serverMsg || 'Loi ket noi den server' });
        }
    }

    handleVerifyMfa = async () => {
        this.setState({ mfaBusy: true, errMessage: '' });
        try {
            const res = await axios.post('/api/verify-mfa-otp', {
                userId: this.state.mfaUserId,
                code: this.state.mfaCode
            });
            if (res && res.errCode === 0) {
                if (res.token) setAuthToken(res.token);
                this.props.userLoginSuccess(res.user);
            } else {
                this.setState({ errMessage: res?.errMessage || 'OTP khong hop le', mfaBusy: false });
            }
        } catch (e) {
            this.setState({ errMessage: 'Loi ket noi', mfaBusy: false });
        }
    };

    handleResendMfa = async () => {
        this.setState({ errMessage: '' });
        try {
            await axios.post('/api/resend-mfa-otp', { userId: this.state.mfaUserId });
            this.setState({ errMessage: 'Da gui lai ma OTP' });
        } catch (e) { this.setState({ errMessage: 'Khong gui duoc OTP' }); }
    };

    handleShowHidePassword = () => {
        this.setState({
            isShowPassword: !this.state.isShowPassword
        })
    }
    handleKeyDown = (event) => {
        console.log('duong check keydown,', event)
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.handleLogin();
        }
    }
    render() {
        if (this.state.mfaStage) {
            return (
                <div className="login-background">
                    <div className="login-container">
                        <div className="login-content row">
                            <div className="col-12 text-login">Xac thuc 2 lop</div>
                            <div className="col-12" style={{ marginBottom: 12, fontSize: 14, color: '#444' }}>
                                Ma OTP da duoc gui den email <b>{this.state.mfaEmail}</b>.
                                Vui long nhap ma (hieu luc 5 phut).
                            </div>
                            <div className="col-12 form-group login-input">
                                <label>Ma OTP 6 so:</label>
                                <input type="text" className="form-control" maxLength={6}
                                    value={this.state.mfaCode}
                                    autoFocus
                                    onChange={(e) => this.setState({ mfaCode: e.target.value.replace(/\D/g, '') })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') this.handleVerifyMfa(); }} />
                            </div>
                            <div className="col-12" style={{ color: 'red' }}>{this.state.errMessage}</div>
                            <div className="col-12">
                                <button className="btn-login" disabled={this.state.mfaBusy}
                                    onClick={this.handleVerifyMfa}>
                                    {this.state.mfaBusy ? 'Dang xac thuc...' : 'Xac nhan'}
                                </button>
                            </div>
                            <div className="col-12" style={{ marginTop: 8 }}>
                                <span className="forgot-password"
                                    style={{ cursor: 'pointer' }}
                                    onClick={this.handleResendMfa}>Gui lai ma OTP</span>
                                <span style={{ float: 'right', cursor: 'pointer', color: '#666' }}
                                    onClick={() => this.setState({
                                        mfaStage: false, mfaUserId: null, mfaCode: '', errMessage: ''
                                    })}>
                                    Quay lai
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-login ">Login</div>
                        <div className="col-12 form-group login-input">
                            <label> Username:</label>

                            <input type="text" className="form-control" placeholder="Enter your username"
                                value={(this.state.username)} onChange={(event) => { this.handleOnchangeUsername(event) }} />
                        </div>
                        <div className="col-12 form-group login-input">
                            <label> Password:</label>
                            <div className="custom-input-password">
                                <input className="form-control" type={this.state.isShowPassword ? 'text' : 'password'} placeholder="Enter your password"
                                    value={this.state.password}
                                    onChange={(event) => { this.handleOnchangePassword(event) }}
                                    onKeyDown={(event) => { this.handleKeyDown(event) }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { this.handleShowHidePassword() }}
                                    aria-label={this.state.isShowPassword ? 'An mat khau' : 'Hien mat khau'}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                >
                                    <i className={this.state.isShowPassword ? 'fa fa-eye' : 'fa fa-eye-slash'} aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        {/* lỗi sẽ báo đỏ */}
                        <div className="col-12" style={{ color: 'red' }}>
                            {this.state.errMessage}
                        </div>

                        <div className="col-12">
                            <button className="btn-login" onClick={() => { this.handleLogin() }}>login</button>
                        </div>
                        <div className="col-12">
                            <span
                                className="forgot-password"
                                style={{ cursor: 'pointer' }}
                                onClick={() => this.props.navigate(path.FORGOT_PASSWORD)}
                            >Forgot password?</span>

                        </div>
                        <div className="col-12 text-center">
                            <span >Or login with:</span>
                        </div>
                        <div className="col-12 social-login">
                            <i className="fab fa-google-plus-g google"></i>
                            <i className="fab fa-facebook-f facebook"></i>
                        </div>
                    </div>

                </div>

            </div>


        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path)),
        //   adminLoginSuccess: (adminInfo) => dispatch(actions.adminLoginSuccess(adminInfo)),
        //  userLoginFail: () => dispatch(actions.adminLoginFail()),
        userLoginSuccess: (userInfor) => dispatch(actions.userLoginSuccess(userInfor))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
