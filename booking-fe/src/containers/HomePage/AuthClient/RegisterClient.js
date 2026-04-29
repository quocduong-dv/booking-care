import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { path } from '../../../utils'; // Đảm bảo đường dẫn này đúng với dự án của bạn
import doctorImg from '../../../assets/images/doctor.jpg';
import './LoginClient.scss';
import { sendOtpRegister, verifyOtpRegister } from '../../../services/userService';

class RegisterClient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            otp: '',
            isOtpSent: false,
            countdown: 60
        }
        this.timer = null;
    }

    async componentDidMount() {
        // Khởi tạo nếu cần
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // Xử lý khi ngôn ngữ thay đổi nếu cần
        if (this.props.language !== prevProps.language) {
            // Logic change language
        }
    }

    componentWillUnmount() {
        // Quan trọng: Xóa timer khi rời khỏi trang để tránh rò rỉ bộ nhớ
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    handleOnChangeInput = (event, id) => {
        this.setState({
            [id]: event.target.value
        });
    }

    startCountdown = () => {
        this.setState({ countdown: 60 });
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.setState(prevState => {
                if (prevState.countdown <= 1) {
                    clearInterval(this.timer);
                    return { countdown: 0 };
                }
                return { countdown: prevState.countdown - 1 };
            });
        }, 1000);
    }

    handleSendOtp = async () => {
        const { email, password, firstName, lastName } = this.state;

        // Kiểm tra validate cơ bản
        if (!email || !password || !firstName || !lastName) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        console.log(">>> Gửi yêu cầu OTP cho email:", email);
        let res = await sendOtpRegister({
            email, password, firstName, lastName
        });
        if (res && res.errCode === 0) {
            this.setState({ isOtpSent: true });
            this.startCountdown();
        } else {
            alert(res.errMessage);
        }
    }

    handleVerifyAndRegister = async () => {
        const { email, otp } = this.state;
        if (!otp) {
            alert("Vui lòng nhập mã OTP!");
            return;
        }

        console.log(">>> Xác nhận OTP & Đăng ký:", otp);
        let res = await verifyOtpRegister({ email, otp });
        if (res && res.errCode === 0) {
            alert("Đăng ký tài khoản thành công!");
            this.props.history.push('/login-client');
        } else {
            alert("Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }

    returnToHome = () => {
        if (this.state.isOtpSent) {
            this.setState({ isOtpSent: false, countdown: 0 });
            if (this.timer) clearInterval(this.timer);
        } else {
            if (this.props.history) {
                this.props.history.push(path.HOMEPAGE);
            }
        }
    }

    handleGoToLogin = () => {
        if (this.props.history) {
            this.props.history.push('/login-client');
        }
    }

    render() {
        const { isOtpSent, countdown, firstName, lastName, email, password, otp } = this.state;

        return (
            <div className="login-container-client">
                <div className="background-decor-client"></div>
                <div className="decor-circle-2-client"></div>

                <div className="login-content-client">
                    <div className="login-form-side-client">
                        <h1 className="login-title-client">
                            <FormattedMessage id="register.title" defaultMessage="Create Account" />
                        </h1>

                        {!isOtpSent ? (
                            <div className="register-form">
                                <div className="input-group-client">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => this.handleOnChangeInput(e, 'firstName')}
                                    />
                                </div>
                                <div className="input-group-client">
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => this.handleOnChangeInput(e, 'lastName')}
                                    />
                                </div>
                                <div className="input-group-client">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => this.handleOnChangeInput(e, 'email')}
                                    />
                                </div>
                                <div className="input-group-client">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => this.handleOnChangeInput(e, 'password')}
                                    />
                                </div>
                                <button className="btn-login-client" onClick={this.handleSendOtp}>
                                    REGISTER & SEND OTP
                                </button>
                            </div>
                        ) : (
                            <div className="otp-form">
                                <p className="otp-instruction-client">
                                    We have sent an OTP code to your email. Please check it.
                                </p>
                                <div className="input-group-client">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => this.handleOnChangeInput(e, 'otp')}
                                    />
                                </div>
                                <div className="otp-timer-client">
                                    {countdown > 0 ? (
                                        <span>Code expires in: <b>{countdown}s</b></span>
                                    ) : (
                                        <span className="resend-link-client" onClick={this.handleSendOtp}>
                                            Resend Code
                                        </span>
                                    )}
                                </div>
                                <button className="btn-login-client" onClick={this.handleVerifyAndRegister}>
                                    VERIFY & LOGIN
                                </button>
                            </div>
                        )}

                        <div className="form-footer-client">
                            <p className="singu-link-client">
                                Already a member? <span onClick={this.handleGoToLogin}>Login now</span>
                            </p>
                            <div className="back-home-client" onClick={this.returnToHome}>
                                <i className="fas fa-chevron-left"></i>
                                {isOtpSent ? " Back to Registration" : " Back to Homepage"}
                            </div>
                        </div>
                    </div>

                    <div className="login-illustration-side-client">
                        <img src={doctorImg} alt="Illustration" className="img-flower-client" />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RegisterClient));