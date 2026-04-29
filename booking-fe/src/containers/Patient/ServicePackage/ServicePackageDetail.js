import React, { Component } from 'react';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getServicePackageDetailService } from '../../../services/userService';

const fmt = (n) => (Number(n) || 0).toLocaleString('vi-VN');

class ServicePackageDetail extends Component {
    state = { pkg: null, loading: true };

    componentDidMount() { this.load(); }
    componentDidUpdate(prev) {
        if (prev.match.params.idOrSlug !== this.props.match.params.idOrSlug) this.load();
    }

    load = async () => {
        this.setState({ loading: true });
        try {
            const id = this.props.match.params.idOrSlug;
            const res = await getServicePackageDetailService(id);
            if (res && res.errCode === 0) this.setState({ pkg: res.data });
        } catch (e) { }
        this.setState({ loading: false });
    };

    render() {
        const { pkg, loading } = this.state;
        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="container" style={{ padding: '32px 16px' }}>
                    {loading && <div>Dang tai...</div>}
                    {!loading && !pkg && <div>Khong tim thay goi kham.</div>}
                    {pkg && (
                        <div className="row">
                            <div className="col-md-5">
                                {pkg.image && (
                                    <img src={pkg.image} alt={pkg.name}
                                        style={{ width: '100%', borderRadius: 8 }} />
                                )}
                            </div>
                            <div className="col-md-7">
                                <h2 style={{ fontWeight: 700 }}>{pkg.name}</h2>
                                <div style={{ margin: '12px 0' }}>
                                    {Number(pkg.priceOriginal) > Number(pkg.priceSale) && (
                                        <span style={{ color: '#999', textDecoration: 'line-through', marginRight: 12, fontSize: 18 }}>
                                            {fmt(pkg.priceOriginal)}d
                                        </span>
                                    )}
                                    <span style={{ color: '#0d6efd', fontWeight: 700, fontSize: 28 }}>
                                        {fmt(pkg.priceSale)}d
                                    </span>
                                </div>
                                {pkg.description && <p>{pkg.description}</p>}
                                {pkg.includes && (
                                    <>
                                        <h5 style={{ marginTop: 20 }}>Bao gom</h5>
                                        <div style={{ whiteSpace: 'pre-line' }}>{pkg.includes}</div>
                                    </>
                                )}
                                <div style={{ marginTop: 24 }}>
                                    <button className="btn btn-primary btn-lg"
                                        onClick={() => alert('Vui long chon bac si thuoc chuyen khoa goi nay de dat lich.')}>
                                        Lien he dat goi
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <HomeFooter />
            </>
        );
    }
}

export default ServicePackageDetail;
