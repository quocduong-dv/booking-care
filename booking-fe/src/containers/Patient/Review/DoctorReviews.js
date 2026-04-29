import React, { Component } from 'react';
import { getReviewsByDoctorService } from '../../../services/userService';
import './DoctorReviews.scss';

class DoctorReviews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            avgRating: 0,
            totalCount: 0,
            loading: true
        };
    }

    async componentDidMount() {
        await this.load();
    }

    async componentDidUpdate(prev) {
        if (prev.doctorId !== this.props.doctorId) {
            await this.load();
        }
    }

    load = async () => {
        const { doctorId } = this.props;
        if (!doctorId || Number(doctorId) < 0) return;
        this.setState({ loading: true });
        try {
            const res = await getReviewsByDoctorService(doctorId, 10, 0);
            if (res && res.errCode === 0) {
                this.setState({
                    items: res.data.items || [],
                    avgRating: res.data.avgRating || 0,
                    totalCount: res.data.totalCount || 0,
                    loading: false
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    renderStars(n) {
        return (
            <span className="static-stars">
                {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={i <= n ? 'on' : ''}>★</span>
                ))}
            </span>
        );
    }

    formatName(p) {
        if (!p) return 'An danh';
        const last = p.lastName ? p.lastName.charAt(0) + '.' : '';
        return `${p.firstName || ''} ${last}`.trim() || 'An danh';
    }

    render() {
        const { items, avgRating, totalCount, loading } = this.state;

        return (
            <div className="doctor-reviews-section">
                <div className="summary">
                    <div className="avg">
                        <span className="score">{avgRating || '—'}</span>
                        <span className="max">/5</span>
                    </div>
                    <div className="count">
                        {this.renderStars(Math.round(avgRating))}
                        <div className="total">{totalCount} danh gia</div>
                    </div>
                </div>
                {loading ? (
                    <div className="loading">Dang tai...</div>
                ) : (
                    <div className="list">
                        {items.length === 0 && <div className="empty">Chua co danh gia nao.</div>}
                        {items.map(r => (
                            <div className="item" key={r.id}>
                                <div className="top">
                                    <strong>{this.formatName(r.patientData)}</strong>
                                    {this.renderStars(r.rating)}
                                </div>
                                <div className="cmt">{r.comment || <i>Khong co binh luan</i>}</div>
                                {r.doctorReply && (
                                    <div className="doctor-reply">
                                        <div className="reply-head">
                                            <i className="fas fa-reply"></i> Phan hoi tu bac si
                                        </div>
                                        <div className="reply-text">{r.doctorReply}</div>
                                    </div>
                                )}
                                <div className="date">
                                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

export default DoctorReviews;
