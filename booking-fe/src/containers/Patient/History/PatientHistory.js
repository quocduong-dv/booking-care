import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import {
    getPatientBookingsService,
    createPaymentUrlService,
    updateAppointmentStatus
} from '../../../services/userService';
import { path } from '../../../utils';
import ReviewModal from '../Review/ReviewModal';
import BookingDetailModal from './BookingDetailModal';
import EmrModal from '../../System/Doctor/EmrModal';
import { exportToExcel, printTable } from '../../../utils/excelExport';
import './PatientHistory.scss';

const STATUS_LABEL = {
    S1: { text: 'Cho xac nhan', cls: 'pending' },
    S2: { text: 'Da xac nhan', cls: 'confirmed' },
    S3: { text: 'Da kham xong', cls: 'done' },
    S4: { text: 'Da huy', cls: 'cancelled' }
};

class PatientHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bookings: [],
            loading: true,
            reviewFor: null,
            detailFor: null,
            emrFor: null,
            busyBookingId: null
        };
    }

    async componentDidMount() {
        await this.load();
    }

    load = async () => {
        const { userInfo } = this.props;
        if (!userInfo?.id) { this.setState({ loading: false }); return; }
        this.setState({ loading: true });
        try {
            const res = await getPatientBookingsService(userInfo.id);
            if (res && res.errCode === 0) {
                this.setState({ bookings: res.data || [], loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    formatAmount = (v) => {
        if (!v) return '—';
        return `${Number(v).toLocaleString('vi-VN')} VND`;
    };

    handlePayNow = async (booking) => {
        const { userInfo, language } = this.props;
        this.setState({ busyBookingId: booking.id });
        try {
            const res = await createPaymentUrlService({
                bookingId: booking.id,
                amount: booking.amount,
                patientId: userInfo.id,
                doctorId: booking.doctorId,
                language: language || 'vn'
            });
            if (res && res.errCode === 0 && res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                alert(res?.errMessage || 'Khong tao duoc lien ket thanh toan');
            }
        } catch (e) {
            alert('Loi ket noi');
        } finally {
            this.setState({ busyBookingId: null });
        }
    };

    handleCancel = async (booking) => {
        const reason = window.prompt('Ly do huy lich:');
        if (reason === null) return;
        if (!reason.trim()) { alert('Vui long nhap ly do'); return; }
        this.setState({ busyBookingId: booking.id });
        try {
            const res = await updateAppointmentStatus({
                appointmentId: booking.id,
                statusId: 'S4',
                cancellationReason: reason.trim()
            });
            if (res && res.errCode === 0) {
                await this.load();
            } else {
                alert(res?.errMessage || 'Khong huy duoc');
            }
        } catch (e) {
            alert('Loi ket noi');
        } finally {
            this.setState({ busyBookingId: null });
        }
    };

    handleGoQueue = (bookingId) => {
        if (this.props.history) this.props.history.push(`/queue/${bookingId}`);
    };

    buildExportColumns = () => {
        const statusMap = { S1: 'Cho xac nhan', S2: 'Da xac nhan', S3: 'Da kham xong', S4: 'Da huy' };
        return [
            { key: 'id', label: 'Ma' },
            { key: 'doctor', label: 'Bac si', get: r => r.doctorData
                ? `${r.doctorData.lastName || ''} ${r.doctorData.firstName || ''}`.trim() : '' },
            { key: 'date', label: 'Ngay' },
            { key: 'time', label: 'Gio', get: r => r.timeTypeDataPatient?.valueVi || r.timeType || '' },
            { key: 'amount', label: 'So tien (VND)', get: r => r.amount || '' },
            { key: 'paymentStatus', label: 'Thanh toan' },
            { key: 'status', label: 'Trang thai', get: r => statusMap[r.statusId] || r.statusId }
        ];
    };

    handleExportCsv = () => {
        exportToExcel(`lich-su-kham-${Date.now()}.xlsx`, this.state.bookings, this.buildExportColumns());
    };

    handlePrint = () => {
        printTable('Lich su kham benh', this.state.bookings, this.buildExportColumns());
    };

    renderPaymentBadge = (b) => {
        const ps = b.paymentStatus;
        const map = {
            paid: { text: 'Da thanh toan', cls: 'paid' },
            pending: { text: 'Cho thanh toan', cls: 'pending' },
            refunded: { text: 'Da hoan tien', cls: 'refunded' },
            failed: { text: 'That bai', cls: 'failed' }
        };
        const m = map[ps] || { text: ps || 'Tien mat', cls: 'cash' };
        return <span className={`pay-badge ${m.cls}`}>{m.text}</span>;
    };

    renderActions = (b) => {
        const { busyBookingId } = this.state;
        const busy = busyBookingId === b.id;
        const actions = [];

        if (b.statusId === 'S1' && b.paymentMethod === 'vnpay' && b.paymentStatus !== 'paid') {
            actions.push(
                <button key="pay" disabled={busy} className="btn btn-sm btn-warning"
                    onClick={() => this.handlePayNow(b)}>
                    Thanh toan
                </button>
            );
        }
        if (b.statusId === 'S1' || b.statusId === 'S2') {
            actions.push(
                <button key="queue" className="btn btn-sm btn-outline-primary"
                    onClick={() => this.handleGoQueue(b.id)}>
                    Xem hang doi
                </button>
            );
            actions.push(
                <button key="cancel" disabled={busy} className="btn btn-sm btn-outline-danger"
                    onClick={() => this.handleCancel(b)}>
                    Huy
                </button>
            );
        }
        if (b.statusId === 'S3') {
            actions.push(
                <button key="emr" className="btn btn-sm btn-outline-info"
                    onClick={() => this.setState({ emrFor: b })}>
                    Ho so kham
                </button>
            );
            actions.push(
                <button key="review" className="btn btn-sm btn-warning"
                    onClick={() => this.setState({ reviewFor: b })}>
                    {b.reviewData?.id ? 'Xem danh gia' : 'Danh gia'}
                </button>
            );
        }
        actions.push(
            <button key="detail" className="btn btn-sm btn-outline-secondary"
                onClick={() => this.setState({ detailFor: b.id })}>
                Chi tiet
            </button>
        );
        return actions;
    };

    render() {
        const { isLoggedIn, userInfo } = this.props;
        const { bookings, loading, reviewFor, detailFor, emrFor } = this.state;

        if (!isLoggedIn) return <Redirect to={path.LOGIN_CLIENT} />;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="patient-history-container">
                    <div className="ph-head">
                        <h2>Lich su kham benh</h2>
                        {bookings.length > 0 && (
                            <div className="ph-actions">
                                <button className="btn btn-sm btn-outline-success" onClick={this.handleExportCsv}>
                                    <i className="fas fa-file-excel"></i> Excel
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={this.handlePrint}>
                                    <i className="fas fa-print"></i> In
                                </button>
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <div className="loading">Dang tai...</div>
                    ) : bookings.length === 0 ? (
                        <div className="empty">Ban chua co lich hen nao.</div>
                    ) : (
                        <div className="table-wrap">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Bac si</th>
                                        <th>Ngay</th>
                                        <th>Gio</th>
                                        <th>So tien</th>
                                        <th>Thanh toan</th>
                                        <th>Trang thai</th>
                                        <th>Thao tac</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => {
                                        const st = STATUS_LABEL[b.statusId] || { text: b.statusId, cls: '' };
                                        return (
                                            <tr key={b.id}>
                                                <td>
                                                    {b.doctorData
                                                        ? `${b.doctorData.lastName || ''} ${b.doctorData.firstName || ''}`.trim()
                                                        : '—'}
                                                </td>
                                                <td>{b.date}</td>
                                                <td>{b.timeTypeDataPatient?.valueVi || b.timeType}</td>
                                                <td>{this.formatAmount(b.amount)}</td>
                                                <td>{this.renderPaymentBadge(b)}</td>
                                                <td><span className={`status-badge ${st.cls}`}>{st.text}</span></td>
                                                <td className="actions">{this.renderActions(b)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <HomeFooter />

                {reviewFor && (
                    <ReviewModal
                        isOpen={!!reviewFor}
                        toggle={() => this.setState({ reviewFor: null })}
                        bookingId={reviewFor.id}
                        patientId={userInfo?.id}
                        onSubmitted={() => { this.load(); }}
                    />
                )}
                {detailFor && (
                    <BookingDetailModal
                        bookingId={detailFor}
                        patientId={userInfo?.id}
                        isOpen={!!detailFor}
                        toggle={() => this.setState({ detailFor: null })}
                    />
                )}
                {emrFor && (
                    <EmrModal
                        isOpen={!!emrFor}
                        toggle={() => this.setState({ emrFor: null })}
                        bookingId={emrFor.id}
                        patientId={userInfo?.id}
                        doctorId={emrFor.doctorId}
                        readonly={true}
                    />
                )}
            </>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language
});
export default connect(mapStateToProps)(PatientHistory);
