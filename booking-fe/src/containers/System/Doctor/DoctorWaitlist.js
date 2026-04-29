import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getWaitlistsByDoctorService, removeFromWaitlistService } from '../../../services/userService';
import { toast } from 'react-toastify';
import './DoctorWaitlist.scss';

class DoctorWaitlist extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [], loading: true, status: 'waiting' };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const { userInfo } = this.props;
        if (!userInfo?.id) return;
        this.setState({ loading: true });
        try {
            const res = await getWaitlistsByDoctorService({
                doctorId: userInfo.roleId === 'R2' ? undefined : userInfo.id,
                status: this.state.status
            });
            if (res && res.errCode === 0) {
                this.setState({ items: res.data || [], loading: false });
            } else { this.setState({ loading: false }); }
        } catch (e) { this.setState({ loading: false }); }
    };

    handleRemove = async (id) => {
        if (!window.confirm('Xoa benh nhan khoi danh sach cho?')) return;
        try {
            const res = await removeFromWaitlistService(id);
            if (res && res.errCode === 0) {
                toast.success('Da xoa');
                this.load();
            }
        } catch (e) { toast.error('Loi'); }
    };

    render() {
        const { items, loading, status } = this.state;
        return (
            <div className="doctor-waitlist container">
                <h2>Danh sach cho cua toi</h2>
                <div className="filter-row">
                    <select value={status} onChange={e => {
                        this.setState({ status: e.target.value }, this.load);
                    }}>
                        <option value="waiting">Dang cho</option>
                        <option value="notified">Da thong bao</option>
                        <option value="">Tat ca</option>
                    </select>
                </div>
                {loading ? <div className="loading">Dang tai...</div> : items.length === 0 ? (
                    <div className="empty">Chua co benh nhan nao trong danh sach cho.</div>
                ) : (
                    <table className="wl-table">
                        <thead>
                            <tr>
                                <th>Benh nhan</th>
                                <th>Lien he</th>
                                <th>Mong muon</th>
                                <th>Ghi chu</th>
                                <th>Trang thai</th>
                                <th>Them luc</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(w => (
                                <tr key={w.id}>
                                    <td>
                                        {w.patientData ?
                                            `${w.patientData.lastName || ''} ${w.patientData.firstName || ''}`.trim()
                                            : 'An danh'}
                                    </td>
                                    <td>
                                        <div>{w.patientData?.email}</div>
                                        <div>{w.patientData?.phonenumber || '—'}</div>
                                    </td>
                                    <td>{w.preferredDate ? `Ngay ${w.preferredDate}` : '—'}
                                        {w.preferredTimeType ? <div>Gio: {w.preferredTimeType}</div> : null}
                                    </td>
                                    <td>{w.note || '—'}</td>
                                    <td><span className={`wl-status ${w.status}`}>{w.status}</span></td>
                                    <td>{new Date(w.createdAt).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => this.handleRemove(w.id)}>Xoa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({ userInfo: state.user.userInfo });
export default connect(mapStateToProps)(DoctorWaitlist);
