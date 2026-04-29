import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import moment from 'moment';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import {
    getPaymentHistoryService,
    markPaymentRefundedService
} from '../../../services/userService';
import './ManagePayment.scss';

class ManagePayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payments: [],
            filterStatus: { label: 'Tat ca', value: '' },
            isShowLoading: false,
            currentPage: 1,
            itemsPerPage: 15
        };
    }

    async componentDidMount() {
        await this.loadPayments();
    }

    loadPayments = async () => {
        this.setState({ isShowLoading: true });
        try {
            const params = {};
            if (this.state.filterStatus.value) params.status = this.state.filterStatus.value;
            const res = await getPaymentHistoryService(params);
            if (res && res.errCode === 0) {
                this.setState({ payments: res.data || [], isShowLoading: false });
            } else {
                this.setState({ payments: [], isShowLoading: false });
            }
        } catch (e) {
            console.log(e);
            this.setState({ isShowLoading: false });
        }
    };

    handleStatusChange = (opt) => {
        this.setState({ filterStatus: opt, currentPage: 1 }, this.loadPayments);
    };

    handleMarkRefunded = async (paymentId) => {
        if (!window.confirm('Xac nhan danh dau giao dich nay la DA HOAN TIEN?')) return;
        this.setState({ isShowLoading: true });
        try {
            const res = await markPaymentRefundedService(paymentId);
            if (res && res.errCode === 0) {
                toast.success('Da danh dau hoan tien');
                await this.loadPayments();
            } else {
                toast.error(res?.errMessage || 'That bai');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Loi khi cap nhat');
            this.setState({ isShowLoading: false });
        }
    };

    statusLabel = (s) => {
        switch (s) {
            case 'pending': return { text: 'Cho thanh toan', cls: 'st-pending' };
            case 'success': return { text: 'Thanh cong', cls: 'st-success' };
            case 'failed': return { text: 'That bai', cls: 'st-failed' };
            case 'refunded': return { text: 'Da hoan tien', cls: 'st-refunded' };
            default: return { text: s || '-', cls: '' };
        }
    };

    render() {
        const { payments, isShowLoading, currentPage, itemsPerPage } = this.state;

        const totalSuccess = payments
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const totalRefunded = payments
            .filter(p => p.status === 'refunded')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const countPending = payments.filter(p => p.status === 'pending').length;
        const countSuccess = payments.filter(p => p.status === 'success').length;

        const statusOptions = [
            { label: 'Tat ca', value: '' },
            { label: 'Cho thanh toan', value: 'pending' },
            { label: 'Thanh cong', value: 'success' },
            { label: 'That bai', value: 'failed' },
            { label: 'Da hoan tien', value: 'refunded' }
        ];

        const totalPages = Math.ceil(payments.length / itemsPerPage) || 1;
        const startIdx = (currentPage - 1) * itemsPerPage;
        const pageItems = payments.slice(startIdx, startIdx + itemsPerPage);

        return (
            <LoadingOverlay active={isShowLoading} spinner text="Loading...">
                <div className="manage-payment-container">
                    <h2 className="page-title">Quan ly thanh toan</h2>

                    <div className="stats-row">
                        <div className="stat-card stat-success">
                            <div className="label">Doanh thu thanh cong</div>
                            <div className="value">{totalSuccess.toLocaleString('vi-VN')} VND</div>
                            <div className="sub">{countSuccess} giao dich</div>
                        </div>
                        <div className="stat-card stat-pending">
                            <div className="label">Dang cho</div>
                            <div className="value">{countPending}</div>
                        </div>
                        <div className="stat-card stat-refunded">
                            <div className="label">Da hoan tien</div>
                            <div className="value">{totalRefunded.toLocaleString('vi-VN')} VND</div>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-item">
                            <label>Trang thai</label>
                            <Select
                                value={this.state.filterStatus}
                                onChange={this.handleStatusChange}
                                options={statusOptions}
                            />
                        </div>
                        <button className="btn-reload" onClick={this.loadPayments}>
                            <i className="fas fa-sync-alt" /> Tai lai
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="payment-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Booking</th>
                                    <th>TxnRef</th>
                                    <th>Ma GD VNPay</th>
                                    <th>Phuong thuc</th>
                                    <th>So tien</th>
                                    <th>Trang thai</th>
                                    <th>Ngay thanh toan</th>
                                    <th>Thao tac</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.length === 0 && (
                                    <tr><td colSpan={9} className="empty">Khong co du lieu</td></tr>
                                )}
                                {pageItems.map((p, i) => {
                                    const st = this.statusLabel(p.status);
                                    return (
                                        <tr key={p.id}>
                                            <td>{startIdx + i + 1}</td>
                                            <td>#{p.bookingId}</td>
                                            <td className="mono">{p.txnRef || '-'}</td>
                                            <td className="mono">{p.transactionId || '-'}</td>
                                            <td>{(p.method || '').toUpperCase()}</td>
                                            <td className="amount">{Number(p.amount || 0).toLocaleString('vi-VN')}</td>
                                            <td><span className={`status-badge ${st.cls}`}>{st.text}</span></td>
                                            <td>{p.paidAt ? moment(p.paidAt).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                            <td>
                                                {p.status === 'success' && (
                                                    <button
                                                        className="btn-refund"
                                                        onClick={() => this.handleMarkRefunded(p.id)}
                                                    >
                                                        Hoan tien
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={p === currentPage ? 'active' : ''}
                                    onClick={() => this.setState({ currentPage: p })}
                                >{p}</button>
                            ))}
                        </div>
                    )}
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language
});

export default connect(mapStateToProps)(ManagePayment);
