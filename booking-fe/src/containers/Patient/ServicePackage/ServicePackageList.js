import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getServicePackagesService } from '../../../services/userService';
import './ServicePackage.scss';

const fmt = (n) => (Number(n) || 0).toLocaleString('vi-VN');

class ServicePackageList extends Component {
    state = { items: [], loading: false };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const res = await getServicePackagesService({ limit: 50 });
            if (res && res.errCode === 0) this.setState({ items: res.data || [] });
        } catch (e) { }
        this.setState({ loading: false });
    };

    goDetail = (p) => this.props.navigate(`/service-package/${p.slug || p.id}`);

    render() {
        const { items, loading } = this.state;
        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="service-package-list container" style={{ padding: '32px 16px' }}>
                    <h2 style={{ fontWeight: 700 }}>Goi kham suc khoe</h2>
                    <p className="text-muted">Lua chon goi kham phu hop voi ban</p>
                    {loading && <div>Dang tai...</div>}
                    {!loading && items.length === 0 && (
                        <div className="text-muted">Chua co goi kham nao.</div>
                    )}
                    <div className="row">
                        {items.map(p => (
                            <div key={p.id} className="col-md-4 col-sm-6" style={{ marginBottom: 24 }}>
                                <div
                                    className="pkg-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => this.goDetail(p)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') this.goDetail(p); }}
                                    style={{
                                        border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden',
                                        background: '#fff', cursor: 'pointer',
                                        transition: 'box-shadow 0.2s',
                                        height: '100%', display: 'flex', flexDirection: 'column'
                                    }}
                                >
                                    {p.image && (
                                        <img src={p.image} alt={p.name}
                                            style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                                    )}
                                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {p.isFeatured && (
                                            <span style={{
                                                alignSelf: 'flex-start',
                                                fontSize: 11, background: '#fff3cd',
                                                color: '#856404', padding: '2px 8px',
                                                borderRadius: 4, marginBottom: 6
                                            }}>NOI BAT</span>
                                        )}
                                        <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{p.name}</h5>
                                        {p.description && (
                                            <p style={{ color: '#666', fontSize: 13, flex: 1 }}>
                                                {String(p.description).slice(0, 120)}
                                                {p.description.length > 120 ? '...' : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: 'auto' }}>
                                            {Number(p.priceOriginal) > Number(p.priceSale) && (
                                                <span style={{ color: '#999', textDecoration: 'line-through', marginRight: 8 }}>
                                                    {fmt(p.priceOriginal)}d
                                                </span>
                                            )}
                                            <span style={{ color: '#0d6efd', fontWeight: 700, fontSize: 18 }}>
                                                {fmt(p.priceSale)}d
                                            </span>
                                        </div>
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
export default connect(null, mapDispatchToProps)(ServicePackageList);
