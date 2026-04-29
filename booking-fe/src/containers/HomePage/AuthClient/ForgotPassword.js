import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { path } from '../../../utils';
import { forgotPasswordService, resetPasswordService } from '../../../services/userService';
import './LoginClient.scss';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            email: '',
            code: '',
            newPassword: '',
            confirmPassword: '',
            showPw: false,
            busy: false,
            message: '',
            messageType: ''
        };
    }

    onChange = (field) => (e) => this.setState({ [field]: e.target.value, message: '' });

    handleRequestReset = async () => {
        const { email } = this.state;
        if (!email || !email.includes('@')) {
            this.setState({ message: 'Vui long nhap email hop le', messageType: 'error' });
            return;
        }
        this.setState({ busy: true, message: '' });
        try {
            const res = await forgotPasswordService(email);
            if (res && res.errCode === 0) {
                this.setState({
                    step: 2,
                    busy: false,
                    message: res.errMessage || 'Neu email ton tai, ma xac thuc da duoc gui.',
                    messageType: 'info'
                });
            } else {
                this.setState({
                    busy: false,
                    message: (res && res.errMessage) || 'Khong gui duoc ma',
                    messageType: 'error'
                });
            }
        } catch (e) {
            this.setState({ busy: false, message: 'Loi ket noi den server', messageType: 'error' });
        }
    };

    handleResetPassword = async () => {
        const { email, code, newPassword, confirmPassword } = this.state;
        if (!code || code.length !== 6) {
            this.setState({ message: 'Ma OTP gom 6 chu so', messageType: 'error' });
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            this.setState({ message: 'Mat khau moi phai co it nhat 6 ky tu', messageType: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            this.setState({ message: 'Mat khau xac nhan khong khop', messageType: 'error' });
            return;
        }
        this.setState({ busy: true, message: '' });
        try {
            const res = await resetPasswordService({ email, code, newPassword });
            if (res && res.errCode === 0) {
                this.setState({
                    busy: false,
                    message: 'Dat lai mat khau thanh cong. Dang chuyen den trang dang nhap...',
                    messageType: 'success'
                });
                setTimeout(() => this.props.navigate(path.LOGIN_CLIENT), 1500);
            } else {
                this.setState({
                    busy: false,
                    message: (res && res.errMessage) || 'Khong dat lai duoc mat khau',
                    messageType: 'error'
                });
            }
        } catch (e) {
            this.setState({ busy: false, message: 'Loi ket noi den server', messageType: 'error' });
        }
    };

    handleResend = async () => {
        this.setState({ busy: true });
        try {
            await forgotPasswordService(this.state.email);
            this.setState({ busy: false, message: 'Da gui lai ma OTP', messageType: 'info' });
        } catch (e) {
            this.setState({ busy: false, message: 'Khong gui lai duoc', messageType: 'error' });
        }
    };

    renderStep1() {
        const { email, busy, message, messageType } = this.state;
        return (
            <>
                <h1 className='login-title-client'>Quen mat khau</h1>
                <p style={{ color: '#444', marginBottom: 16 }}>
                    Nhap email tai khoan, chung toi se gui ma xac thuc 6 so den email cua ban.
                </p>
                <div className='input-group-client'>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        autoFocus
                        onChange={this.onChange('email')}
                        onKeyDown={(e) => { if (e.key === 'Enter') this.handleRequestReset(); }}
                    />
                </div>
                {message && (
                    <div style={{
                        color: messageType === 'error' ? '#d93025' : (messageType === 'success' ? '#188038' : '#1967d2'),
                        fontSize: 14, marginBottom: 12
                    }}>{message}</div>
                )}
                <button
                    className='btn-login-client'
                    disabled={busy}
                    onClick={this.handleRequestReset}
                >{busy ? 'Dang gui...' : 'Gui ma xac thuc'}</button>
                <p className='singu-link-client'>
                    <b><span onClick={() => this.props.navigate(path.LOGIN_CLIENT)}>Quay lai dang nhap</span></b>
                </p>
            </>
        );
    }

    renderStep2() {
        const { email, code, newPassword, confirmPassword, showPw, busy, message, messageType } = this.state;
        return (
            <>
                <h1 className='login-title-client'>Dat lai mat khau</h1>
                <p style={{ color: '#444', marginBottom: 12 }}>
                    Nhap ma xac thuc da gui den <b>{email}</b> va mat khau moi.
                </p>
                <div className='input-group-client'>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Ma OTP 6 so"
                        value={code}
                        autoFocus
                        onChange={(e) => this.setState({ code: e.target.value.replace(/\D/g, ''), message: '' })}
                    />
                </div>
                <div className='input-group-client'>
                    <input
                        type={showPw ? 'text' : 'password'}
                        placeholder='Mat khau moi (toi thieu 6 ky tu)'
                        value={newPassword}
                        onChange={this.onChange('newPassword')}
                    />
                </div>
                <div className='input-group-client'>
                    <input
                        type={showPw ? 'text' : 'password'}
                        placeholder='Xac nhan mat khau moi'
                        value={confirmPassword}
                        onChange={this.onChange('confirmPassword')}
                        onKeyDown={(e) => { if (e.key === 'Enter') this.handleResetPassword(); }}
                    />
                </div>
                <label style={{ display: 'block', fontSize: 13, margin: '0 0 12px 2px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={showPw}
                        onChange={() => this.setState({ showPw: !showPw })}
                        style={{ marginRight: 6 }}
                    />
                    Hien mat khau
                </label>
                {message && (
                    <div style={{
                        color: messageType === 'error' ? '#d93025' : (messageType === 'success' ? '#188038' : '#1967d2'),
                        fontSize: 14, marginBottom: 12
                    }}>{message}</div>
                )}
                <button
                    className='btn-login-client'
                    disabled={busy}
                    onClick={this.handleResetPassword}
                >{busy ? 'Dang xu ly...' : 'Dat lai mat khau'}</button>
                <p className='singu-link-client'>
                    <span style={{ cursor: 'pointer', color: '#0046be' }} onClick={this.handleResend}>Gui lai ma</span>
                    {' | '}
                    <span style={{ cursor: 'pointer', color: '#0046be' }}
                        onClick={() => this.setState({ step: 1, code: '', newPassword: '', confirmPassword: '', message: '' })}>
                        Dung email khac
                    </span>
                </p>
            </>
        );
    }

    render() {
        return (
            <div className='login-container-client'>
                <div className='background-decor-client'></div>
                <div className='decor-circle-2-client'></div>
                <div className='login-content-client'>
                    <div className='login-form-side-client' style={{ maxWidth: 460 }}>
                        {this.state.step === 1 ? this.renderStep1() : this.renderStep2()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ language: state.app.language });
const mapDispatchToProps = dispatch => ({
    navigate: (p) => dispatch(push(p))
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
