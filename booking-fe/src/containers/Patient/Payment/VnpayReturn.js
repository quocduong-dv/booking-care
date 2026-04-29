import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { verifyVnpayReturnService } from '../../../services/userService';
import './VnpayReturn.scss';

class VnpayReturn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            errCode: null,
            errMessage: '',
            payment: null
        };
    }

    async componentDidMount() {
        const qs = this.props.location && this.props.location.search ? this.props.location.search : '';
        try {
            const res = await verifyVnpayReturnService(qs);
            this.setState({
                loading: false,
                errCode: res && typeof res.errCode !== 'undefined' ? res.errCode : -1,
                errMessage: res && res.errMessage ? res.errMessage : '',
                payment: res && res.payment ? res.payment : null
            });
        } catch (e) {
            this.setState({ loading: false, errCode: -1, errMessage: 'Khong the xac minh thanh toan' });
        }
    }

    render() {
        const { loading, errCode, errMessage, payment } = this.state;
        const success = errCode === 0;
        return (
            <div className="vnpay-return-page">
                <div className={`result-card ${success ? 'success' : 'failed'}`}>
                    {loading ? (
                        <>
                            <div className="spinner" />
                            <h3>Dang xac minh giao dich...</h3>
                        </>
                    ) : (
                        <>
                            <div className="icon">{success ? '✓' : '✕'}</div>
                            <h2>{success ? 'Thanh toan thanh cong' : 'Thanh toan that bai'}</h2>
                            {payment && (
                                <div className="details">
                                    <div><strong>Ma booking:</strong> #{payment.bookingId}</div>
                                    <div><strong>So tien:</strong> {Number(payment.amount).toLocaleString('vi-VN')} VND</div>
                                    {payment.transactionId && (
                                        <div><strong>Ma giao dich VNPay:</strong> {payment.transactionId}</div>
                                    )}
                                    {payment.bankCode && (
                                        <div><strong>Ngan hang:</strong> {payment.bankCode}</div>
                                    )}
                                </div>
                            )}
                            {!success && errMessage && (
                                <p className="error-message">{errMessage}</p>
                            )}
                            <div className="actions">
                                <Link to="/home" className="btn-primary">Ve trang chu</Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language
});

export default connect(mapStateToProps)(VnpayReturn);
