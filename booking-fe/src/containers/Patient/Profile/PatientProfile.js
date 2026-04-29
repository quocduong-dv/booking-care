import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getLoyaltyPointsService, editUserService, getAllUsers } from '../../../services/userService';

class PatientProfile extends Component {
    state = {
        points: 0,
        loading: true,
        user: null,
        form: { insuranceNumber: '', insuranceProvider: '' },
        saving: false
    };

    componentDidMount() { this.load(); }

    load = async () => {
        const uid = this.props.userInfo && this.props.userInfo.id;
        if (!uid) { this.setState({ loading: false }); return; }
        try {
            const [pts, usr] = await Promise.all([
                getLoyaltyPointsService(),
                getAllUsers(uid)
            ]);
            const u = usr && usr.users ? usr.users : null;
            this.setState({
                points: (pts && pts.errCode === 0) ? (pts.points || 0) : 0,
                user: u,
                form: {
                    insuranceNumber: (u && u.insuranceNumber) || '',
                    insuranceProvider: (u && u.insuranceProvider) || ''
                },
                loading: false
            });
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    onChange = (k) => (e) => this.setState({ form: { ...this.state.form, [k]: e.target.value } });

    save = async () => {
        const { user, form } = this.state;
        if (!user) return;
        this.setState({ saving: true });
        try {
            const res = await editUserService({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                roleId: user.roleId,
                positionId: user.positionId || 'P0',
                gender: user.gender || 'M',
                phoneNumber: user.phoneNumber,
                insuranceNumber: form.insuranceNumber || null,
                insuranceProvider: form.insuranceProvider || null
            });
            if (res && res.errCode === 0) toast.success('Da cap nhat thong tin');
            else toast.error(res?.errMessage || 'Luu that bai');
        } catch (e) { toast.error('Loi ket noi'); }
        this.setState({ saving: false });
    };

    render() {
        const { points, loading, user, form, saving } = this.state;
        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="container" style={{ padding: '32px 16px', maxWidth: 840 }}>
                    <h2 style={{ fontWeight: 700 }}>Ho so cua toi</h2>

                    {loading ? <div>Dang tai...</div> : (
                        <>
                            <div className="row" style={{ marginBottom: 24 }}>
                                <div className="col-md-6">
                                    <div style={{
                                        background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                                        color: '#fff', padding: 24, borderRadius: 10
                                    }}>
                                        <div style={{ fontSize: 14, opacity: 0.9 }}>Diem tich luy</div>
                                        <div style={{ fontSize: 42, fontWeight: 700, marginTop: 6 }}>
                                            {points.toLocaleString('vi-VN')}
                                        </div>
                                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                                            Tich 1 diem cho moi 10.000 VND booking da hoan thanh
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div style={{ background: '#f8f9fa', padding: 24, borderRadius: 10 }}>
                                        <div style={{ fontSize: 14, color: '#666' }}>Email</div>
                                        <div style={{ fontWeight: 600 }}>{user && user.email}</div>
                                        <div style={{ fontSize: 14, color: '#666', marginTop: 12 }}>Ho ten</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {user ? `${user.lastName || ''} ${user.firstName || ''}`.trim() : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: '#fff', border: '1px solid #e5e7eb',
                                padding: 24, borderRadius: 10
                            }}>
                                <h4>Bao hiem y te (BHYT)</h4>
                                <p className="text-muted" style={{ fontSize: 13 }}>
                                    Thong tin bao hiem se duoc tu dong dien khi ban dat lich kham.
                                </p>
                                <div className="row">
                                    <div className="col-md-6 form-group">
                                        <label>So the BHYT</label>
                                        <input className="form-control" value={form.insuranceNumber}
                                            onChange={this.onChange('insuranceNumber')} />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label>Don vi bao hiem</label>
                                        <input className="form-control"
                                            placeholder="VD: BHYT, Bao Viet, PVI..."
                                            value={form.insuranceProvider}
                                            onChange={this.onChange('insuranceProvider')} />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    disabled={saving}
                                    onClick={this.save}
                                >{saving ? 'Dang luu...' : 'Luu thay doi'}</button>
                            </div>
                        </>
                    )}
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = state => ({ userInfo: state.user.userInfo });
export default connect(mapStateToProps)(PatientProfile);
