import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { searchDoctorsService, getAllSpecialty, getAllClinic } from '../../../services/userService';

class DoctorSearch extends Component {
    state = {
        items: [], loading: false,
        specialties: [], clinics: [],
        filters: { q: '', specialtyId: '', clinicId: '', minRating: '', sort: '' }
    };

    async componentDidMount() {
        const params = new URLSearchParams(window.location.search);
        const qFromUrl = params.get('q') || '';
        if (qFromUrl) {
            this.setState({ filters: { ...this.state.filters, q: qFromUrl } });
        }
        try {
            const [sp, cl] = await Promise.all([getAllSpecialty(), getAllClinic()]);
            this.setState({
                specialties: (sp && sp.data) || [],
                clinics: (cl && cl.data) || []
            });
        } catch (e) { }
        this.search();
    }

    onField = (k) => (e) => this.setState({ filters: { ...this.state.filters, [k]: e.target.value } });

    search = async () => {
        this.setState({ loading: true });
        try {
            const res = await searchDoctorsService(this.state.filters);
            if (res && res.errCode === 0) this.setState({ items: res.data || [] });
            else this.setState({ items: [] });
        } catch (e) { this.setState({ items: [] }); }
        this.setState({ loading: false });
    };

    reset = () => this.setState({
        filters: { q: '', specialtyId: '', clinicId: '', minRating: '', sort: '' }
    }, this.search);

    render() {
        const { items, loading, specialties, clinics, filters } = this.state;
        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="container" style={{ padding: '24px 16px' }}>
                    <h2 style={{ fontWeight: 700 }}>Tim bac si</h2>

                    <div style={{
                        background: '#f8f9fa', padding: 16, borderRadius: 8,
                        marginBottom: 20
                    }}>
                        <div className="row">
                            <div className="col-md-4 form-group">
                                <label htmlFor="q">Ten bac si</label>
                                <input id="q" className="form-control"
                                    placeholder="Nhap ten..."
                                    value={filters.q} onChange={this.onField('q')}
                                    onKeyDown={(e) => { if (e.key === 'Enter') this.search(); }} />
                            </div>
                            <div className="col-md-4 form-group">
                                <label htmlFor="sp">Chuyen khoa</label>
                                <select id="sp" className="form-control"
                                    value={filters.specialtyId} onChange={this.onField('specialtyId')}>
                                    <option value="">Tat ca</option>
                                    {specialties.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 form-group">
                                <label htmlFor="cl">Phong kham</label>
                                <select id="cl" className="form-control"
                                    value={filters.clinicId} onChange={this.onField('clinicId')}>
                                    <option value="">Tat ca</option>
                                    {clinics.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 form-group">
                                <label htmlFor="mr">Danh gia toi thieu</label>
                                <select id="mr" className="form-control"
                                    value={filters.minRating} onChange={this.onField('minRating')}>
                                    <option value="">Tat ca</option>
                                    <option value="3">3 sao tro len</option>
                                    <option value="4">4 sao tro len</option>
                                    <option value="4.5">4.5 sao tro len</option>
                                </select>
                            </div>
                            <div className="col-md-4 form-group">
                                <label htmlFor="st">Sap xep</label>
                                <select id="st" className="form-control"
                                    value={filters.sort} onChange={this.onField('sort')}>
                                    <option value="">Mac dinh</option>
                                    <option value="rating">Theo danh gia cao nhat</option>
                                    <option value="reviews">Theo so luot danh gia</option>
                                </select>
                            </div>
                            <div className="col-md-4" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                <button className="btn btn-primary" onClick={this.search}>
                                    <i className="fas fa-search" aria-hidden="true"></i> Tim
                                </button>
                                <button className="btn btn-outline-secondary" onClick={this.reset}>Xoa</button>
                            </div>
                        </div>
                    </div>

                    {loading && <div>Dang tim...</div>}
                    {!loading && items.length === 0 && (
                        <div className="text-muted">Khong tim thay bac si phu hop.</div>
                    )}
                    <div className="row">
                        {items.map(d => (
                            <div key={d.id} className="col-md-6" style={{ marginBottom: 16 }}>
                                <div
                                    role="button" tabIndex={0}
                                    onClick={() => this.props.navigate(`/detail-doctor/${d.id}`)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') this.props.navigate(`/detail-doctor/${d.id}`); }}
                                    style={{
                                        display: 'flex', gap: 14, padding: 14,
                                        border: '1px solid #e5e7eb', borderRadius: 8,
                                        background: '#fff', cursor: 'pointer', height: '100%'
                                    }}
                                >
                                    <img
                                        src={d.image || 'https://ui-avatars.com/api/?name=Dr'}
                                        alt=""
                                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>
                                            {d.positionData && (d.positionData.valueVi ? d.positionData.valueVi + ', ' : '')}
                                            {(d.lastName || '') + ' ' + (d.firstName || '')}
                                        </div>
                                        {d.Doctor_Infor && d.Doctor_Infor.specialtyData && (
                                            <div style={{ fontSize: 13, color: '#666' }}>
                                                {d.Doctor_Infor.specialtyData.name}
                                            </div>
                                        )}
                                        <div style={{ marginTop: 6, fontSize: 13 }}>
                                            <span style={{ color: '#f59e0b' }}>
                                                {'★'.repeat(Math.round(d.avgRating || 0))}
                                                {'☆'.repeat(5 - Math.round(d.avgRating || 0))}
                                            </span>
                                            <span style={{ marginLeft: 6, color: '#666' }}>
                                                {d.avgRating ? `${d.avgRating}/5` : 'Chua co danh gia'}
                                                {d.reviewCount ? ` · ${d.reviewCount} luot` : ''}
                                            </span>
                                        </div>
                                        {d.Doctor_Infor && d.Doctor_Infor.priceTypeData && (
                                            <div style={{ marginTop: 4, color: '#0d6efd', fontSize: 13, fontWeight: 600 }}>
                                                Gia kham: {d.Doctor_Infor.priceTypeData.valueVi} VND
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapDispatchToProps = dispatch => ({ navigate: (p) => dispatch(push(p)) });
export default connect(null, mapDispatchToProps)(DoctorSearch);
