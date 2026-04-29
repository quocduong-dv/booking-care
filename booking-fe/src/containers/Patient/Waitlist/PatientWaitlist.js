import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getMyWaitlistService, removeFromWaitlistService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { path } from '../../../utils';
import './PatientWaitlist.scss';

class PatientWaitlist extends Component {
    state = { items: [], loading: true };

    async componentDidMount() { await this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const res = await getMyWaitlistService();
            if (res && res.errCode === 0) {
                this.setState({ items: res.data || [], loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) { this.setState({ loading: false }); }
    };

    handleRemove = async (id) => {
        if (!window.confirm('Xoa khoi danh sach cho?')) return;
        try {
            const res = await removeFromWaitlistService(id);
            if (res && res.errCode === 0) {
                toast.success('Da xoa');
                this.load();
            }
        } catch (e) { toast.error('Loi'); }
    };

    render() {
        const { isLoggedIn } = this.props;
        const { items, loading } = this.state;
        if (!isLoggedIn) return <Redirect to={path.LOGIN_CLIENT} />;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="patient-waitlist container">
                    <h2>Danh sach cho cua toi</h2>
                    {loading ? <div className="loading">Dang tai...</div> : items.length === 0 ? (
                        <div className="empty">Ban chua co trong danh sach cho nao.</div>
                    ) : (
                        <div className="wl-list">
                            {items.map(w => (
                                <div className="wl-card" key={w.id}>
                                    <div className="head">
                                        <strong>
                                            BS: {w.doctorData ?
                                                `${w.doctorData.lastName} ${w.doctorData.firstName}`.trim() : '—'}
                                        </strong>
                                        <span className={`badge ${w.status}`}>{w.status}</span>
                                    </div>
                                    <div className="details">
                                        {w.preferredDate && <div>Ngay mong muon: {w.preferredDate}</div>}
                                        {w.note && <div>Ghi chu: {w.note}</div>}
                                        <div>Them luc: {new Date(w.createdAt).toLocaleString('vi-VN')}</div>
                                        {w.notifiedAt && (
                                            <div className="notified">
                                                Da thong bao: {new Date(w.notifiedAt).toLocaleString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                    <div className="actions">
                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => this.handleRemove(w.id)}>Xoa</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo
});
export default connect(mapStateToProps)(PatientWaitlist);
