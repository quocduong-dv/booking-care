import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { postVerifyBookAppointment } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader';
import { LANGUAGES } from '../../utils';
import './VerifyEmail.scss';

class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusVerify: false,
            errCode: 0
        }
    }

    async componentDidMount() {
        if (this.props.location && this.props.location.search) {
            const urlParams = new URLSearchParams(this.props.location.search);
            const token = urlParams.get('token');
            const doctorId = urlParams.get('doctorId');
            const res = await postVerifyBookAppointment({ token, doctorId });
            this.setState({
                statusVerify: true,
                errCode: res && typeof res.errCode !== 'undefined' ? res.errCode : -1
            });
        }
    }

    getCopy() {
        const en = this.props.language === LANGUAGES.EN;
        return {
            loading: en ? 'Verifying your appointment...' : 'Dang xac thuc lich hen...',
            successTitle: en ? 'Appointment confirmed' : 'Xac nhan lich hen thanh cong',
            successBody: en
                ? 'Your appointment has been confirmed. We have sent the details to your email.'
                : 'Lich hen cua ban da duoc xac nhan. Chi tiet da duoc gui den email cua ban.',
            failTitle: en ? 'Unable to confirm' : 'Khong the xac nhan',
            failBody: en
                ? 'This link is invalid or the appointment has already been confirmed.'
                : 'Duong dan khong hop le hoac lich hen da duoc xac nhan truoc do.',
            homeBtn: en ? 'Back to home' : 'Ve trang chu'
        };
    }

    render() {
        const { statusVerify, errCode } = this.state;
        const copy = this.getCopy();
        const isSuccess = +errCode === 0;

        return (
            <>
                <HomeHeader />
                <div className="verify-email-container">
                    <div className="verify-card">
                        {!statusVerify ? (
                            <div className="verify-loading">
                                <div className="spinner" />
                                <div className="loading-text">{copy.loading}</div>
                            </div>
                        ) : (
                            <div className={`verify-result ${isSuccess ? 'is-success' : 'is-fail'}`}>
                                <div className="icon">
                                    {isSuccess ? (
                                        <i className="fas fa-check-circle" />
                                    ) : (
                                        <i className="fas fa-times-circle" />
                                    )}
                                </div>
                                <div className="title">
                                    {isSuccess ? copy.successTitle : copy.failTitle}
                                </div>
                                <div className="body">
                                    {isSuccess ? copy.successBody : copy.failBody}
                                </div>
                                <a className="home-btn" href="/home">{copy.homeBtn}</a>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language
});

export default connect(mapStateToProps)(VerifyEmail);
