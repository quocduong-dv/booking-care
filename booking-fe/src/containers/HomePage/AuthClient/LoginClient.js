import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './LoginClient.scss';
import { path } from '../../../utils';
import doctorImg from '../../../assets/images/doctor.jpg';
import { handleLoginApi } from '../../../services/userService';
import { userLoginSuccess } from '../../../store/actions';
import { setAuthToken } from '../../../axios';
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            passowrd: ''
        }
    }
    async componentDidMount() {


    }


    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {

        }

    }
    // handleOnChangeInput = (event, id) => {
    //     let copySate = { ...this.state };
    //     copySate[id] = event.target.value;
    //     this.setState({
    //         ...copySate
    //     });
    // }
    handleOnChangeInput = (event, id) => {
        let value = event.target.value;
        this.setState({
            [id]: value
        }, () => {
            // Log giá trị ngay sau khi state thay đổi
            console.log(`Check input change: ${id} = `, this.state[id]);
        });
    }

    handleLogin = async () => {
        console.log('>>> Nút LOGIN đã được nhấn!');
        console.log('Dữ liệu gửi đi:', {
            username: this.state.username,
            password: this.state.password
        });

        // Sau này bạn sẽ viết code gọi API ở đây
        if (!this.state.username || !this.state.passowrd) {
            alert("Vui lòng nhập đầy đủ tài khoản/mật khẩu");
            return;
        }
        try {
            let data = await handleLoginApi(this.state.username, this.state.passowrd);
            if (data && data.errCode !== 0) {
                alert(data.message);
            } else {
                if (data && data.user) {
                    if (data.user.roleId !== 'R3') {
                        alert('Tai khoan nay khong phai benh nhan. Vui long dung trang dang nhap quan tri.');
                        return;
                    }
                    if (data.token) setAuthToken(data.token);
                    this.props.userLoginSuccess(data.user);
                    this.props.history.push(path.HOMEPAGE);
                }
            }
        } catch (error) {
            if (error.response) {
                if (error.response.data) {
                    alert(error.response.data.message);
                }
            }
            console.log(error);
        }
    }

    handleSocialLogin = (platform) => {
        if (platform === 'Google') {
            window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
        }
        console.log(`>>> Bạn vừa chọn đăng nhập bằng: ${platform}`);
    }

    handleSignupRedirect = () => {
        if (this.props.history) {
            this.props.history.push(path.REGISTER_CLIENT);
        }
    }
    render() {

        return (
            <div className='login-container-client'>
                <div className='background-decor-client'>
                </div>
                <div className='decor-circle-2-client'></div>
                <div className='login-content-client'>
                    <div className='login-form-side-client'>
                        <h1 className='login-title-client'>
                            <FormattedMessage id="login.tiltle" defaultMessage="Login Now" />

                        </h1>
                        <div className='input-group-client'>
                            <input type="text" placeholder="Email or Username" value={this.state.username}
                                onChange={(event) => this.handleOnChangeInput(event, 'username')}
                            />

                        </div>
                        <div className='input-group-client'>
                            <input type="password" placeholder='Password' value={this.state.passowrd}
                                onChange={(event) => this.handleOnChangeInput(event, 'passowrd')} />
                        </div>
                        <button className='btn-login-client' onClick={() => this.handleLogin()}>Login</button>
                        <p style={{ textAlign: 'right', margin: '8px 0 0' }}>
                            <span
                                style={{ cursor: 'pointer', color: '#0046be', fontSize: 14 }}
                                onClick={() => this.props.history && this.props.history.push(path.FORGOT_PASSWORD)}
                            >Quen mat khau?</span>
                        </p>
                        <p className='social-login-text-client'>Or login with</p>
                        <div className='social-buttons-client'>
                            <button className='social-btn-client' onClick={() => this.handleSocialLogin('Email')}>
                                <i className='fab fa-email'></i>Email

                            </button>
                            <button className='social-btn-client' onClick={() => this.handleSocialLogin('Google')}>
                                <i className='fab fa-google'></i>Google
                            </button>
                        </div>
                        <p className='singu-link-client'>
                            Don't have an account ? <b><span onClick={() => this.handleSignupRedirect()}>Signup now</span></b>
                        </p>
                    </div>
                    <div className='login-illustration-side-client'>
                        <img src={doctorImg}
                            alt="Illustration"
                            className="img-flower-client" />
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
        userLoginSuccess: (userInfo) => dispatch(userLoginSuccess(userInfo))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
