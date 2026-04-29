import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { getAllReviewsService, moderateReviewService } from '../../../services/userService';

const statusLabel = (isApproved) => isApproved
    ? <span className="badge badge-success">Da duyet</span>
    : <span className="badge badge-warning">Cho duyet</span>;

class ManageReview extends Component {
    state = { items: [], loading: false, status: 'all' };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const opts = this.state.status === 'all' ? {} : { status: this.state.status };
            const res = await getAllReviewsService(opts);
            if (res && res.errCode === 0) this.setState({ items: res.data?.items || [] });
        } catch (e) { }
        this.setState({ loading: false });
    };

    approve = async (r, isApproved) => {
        const note = isApproved ? null : window.prompt('Ly do an review (tuy chon):') || null;
        const res = await moderateReviewService({ id: r.id, isApproved, note });
        if (res && res.errCode === 0) {
            toast.success(isApproved ? 'Da duyet' : 'Da an');
            this.load();
        } else toast.error('Thao tac that bai');
    };

    onFilter = (e) => this.setState({ status: e.target.value }, this.load);

    render() {
        const { items, loading, status } = this.state;
        return (
            <div className="container-fluid" style={{ padding: 24 }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 style={{ margin: 0 }}><i className="fas fa-star"></i> Kiem duyet danh gia</h3>
                    <select className="form-control" style={{ width: 200 }} value={status} onChange={this.onFilter}>
                        <option value="all">Tat ca</option>
                        <option value="pending">Cho duyet</option>
                        <option value="approved">Da duyet</option>
                    </select>
                </div>

                {loading ? <div>Dang tai...</div> : (
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th>#</th>
                                    <th>Benh nhan</th>
                                    <th>Bac si</th>
                                    <th>Sao</th>
                                    <th>Binh luan</th>
                                    <th>Trang thai</th>
                                    <th>Ngay</th>
                                    <th style={{ width: 160 }}>Hanh dong</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && <tr><td colSpan={8} className="text-center text-muted">Khong co review</td></tr>}
                                {items.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>
                                            {(r.patientData?.lastName || '') + ' ' + (r.patientData?.firstName || '')}
                                            <div style={{ fontSize: 11, color: '#888' }}>{r.patientData?.email}</div>
                                        </td>
                                        <td>{(r.doctorData?.lastName || '') + ' ' + (r.doctorData?.firstName || '')}</td>
                                        <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                                        <td style={{ maxWidth: 360 }}>{r.comment || '-'}</td>
                                        <td>{statusLabel(r.isApproved)}</td>
                                        <td style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                                        <td>
                                            {r.isApproved ? (
                                                <button className="btn btn-sm btn-outline-warning" onClick={() => this.approve(r, false)}>An</button>
                                            ) : (
                                                <button className="btn btn-sm btn-outline-success" onClick={() => this.approve(r, true)}>Duyet</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
}

export default connect()(ManageReview);
