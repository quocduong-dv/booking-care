import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getReviewsByDoctorService, replyReviewService } from '../../../services/userService';
import { connectSocket, onSocket, joinRooms } from '../../../services/socket';
import { toast } from 'react-toastify';
import './MyReviews.scss';

class MyReviews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            avgRating: 0,
            totalCount: 0,
            loading: true,
            editingId: null,
            replyDraft: ''
        };
        this._unsubs = [];
    }

    async componentDidMount() {
        connectSocket();
        const { userInfo } = this.props;
        if (userInfo?.id) {
            joinRooms({ role: 'R2', userId: userInfo.id });
        }
        await this.load();

        this._unsubs.push(onSocket('review:new', () => this.load()));
    }

    componentWillUnmount() {
        this._unsubs.forEach(u => typeof u === 'function' && u());
    }

    load = async () => {
        const { userInfo } = this.props;
        if (!userInfo?.id) return;
        try {
            const res = await getReviewsByDoctorService(userInfo.id, 50, 0);
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

    handleEdit = (r) => {
        this.setState({ editingId: r.id, replyDraft: r.doctorReply || '' });
    };

    handleCancelEdit = () => {
        this.setState({ editingId: null, replyDraft: '' });
    };

    handleSubmit = async () => {
        const { editingId, replyDraft } = this.state;
        if (!editingId) return;
        try {
            const res = await replyReviewService({ id: editingId, reply: replyDraft });
            if (res && res.errCode === 0) {
                toast.success('Da luu phan hoi');
                this.setState({ editingId: null, replyDraft: '' });
                await this.load();
            } else {
                toast.error(res?.errMessage || 'That bai');
            }
        } catch (e) { toast.error('Loi ket noi'); }
    };

    handleDeleteReply = async (r) => {
        if (!window.confirm('Xoa phan hoi cua ban cho danh gia nay?')) return;
        try {
            const res = await replyReviewService({ id: r.id, reply: '' });
            if (res && res.errCode === 0) {
                toast.success('Da xoa phan hoi');
                await this.load();
            }
        } catch (e) { toast.error('Loi'); }
    };

    renderStars(n) {
        return (
            <span className="stars">
                {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={i <= n ? 'on' : ''}>★</span>
                ))}
            </span>
        );
    }

    render() {
        const { items, avgRating, totalCount, loading, editingId, replyDraft } = this.state;
        return (
            <div className="my-reviews-page container">
                <h2>Danh gia cua toi</h2>
                <div className="summary-card">
                    <div className="avg-big">
                        <span>{avgRating || '—'}</span>
                        <small>/5</small>
                    </div>
                    <div className="meta">
                        {this.renderStars(Math.round(avgRating))}
                        <div>{totalCount} danh gia</div>
                    </div>
                </div>
                {loading ? (
                    <div className="loading">Dang tai...</div>
                ) : (
                    <div className="reviews-list">
                        {items.length === 0 && <div className="empty">Chua co danh gia nao.</div>}
                        {items.map(r => (
                            <div className="row-item" key={r.id}>
                                <div className="head">
                                    <strong>
                                        {r.patientData
                                            ? `${r.patientData.firstName || ''} ${r.patientData.lastName || ''}`.trim()
                                            : 'An danh'}
                                    </strong>
                                    {this.renderStars(r.rating)}
                                    <span className="date">
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="cmt">{r.comment || <i>Khong co binh luan</i>}</div>

                                {r.doctorReply && editingId !== r.id && (
                                    <div className="doctor-reply">
                                        <div className="reply-head">
                                            <i className="fas fa-reply"></i> Phan hoi cua ban
                                            <span className="reply-date">
                                                {r.doctorReplyAt && new Date(r.doctorReplyAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="reply-text">{r.doctorReply}</div>
                                    </div>
                                )}

                                {editingId === r.id ? (
                                    <div className="reply-editor">
                                        <textarea value={replyDraft} rows={3}
                                            placeholder="Viet phan hoi..."
                                            onChange={e => this.setState({ replyDraft: e.target.value })} />
                                        <div className="actions">
                                            <button className="btn btn-sm btn-primary" onClick={this.handleSubmit}>Luu</button>
                                            <button className="btn btn-sm btn-outline-secondary" onClick={this.handleCancelEdit}>Huy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="row-actions">
                                        <button className="btn btn-sm btn-outline-primary"
                                            onClick={() => this.handleEdit(r)}>
                                            {r.doctorReply ? 'Sua phan hoi' : 'Tra loi'}
                                        </button>
                                        {r.doctorReply && (
                                            <button className="btn btn-sm btn-outline-danger"
                                                onClick={() => this.handleDeleteReply(r)}>
                                                Xoa phan hoi
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({ userInfo: state.user.userInfo });
export default connect(mapStateToProps)(MyReviews);
