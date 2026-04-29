import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
    getVouchersService, createVoucherService,
    updateVoucherService, deleteVoucherService
} from '../../../services/userService';

const EMPTY = {
    code: '', description: '', type: 'fixed', value: 0,
    maxDiscount: '', minOrderAmount: 0,
    startDate: '', endDate: '', usageLimit: '', isActive: true
};

const toInt = (v) => (v === '' || v === null || v === undefined) ? null : parseInt(v, 10);
const dtInput = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

class ManageVoucher extends Component {
    state = { items: [], loading: false, showForm: false, editing: null, form: { ...EMPTY } };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const res = await getVouchersService();
            if (res && res.errCode === 0) this.setState({ items: res.data || [] });
        } catch (e) { }
        this.setState({ loading: false });
    };

    openCreate = () => this.setState({ editing: null, form: { ...EMPTY }, showForm: true });

    openEdit = (v) => this.setState({
        editing: v,
        form: {
            code: v.code || '',
            description: v.description || '',
            type: v.type || 'fixed',
            value: v.value || 0,
            maxDiscount: v.maxDiscount || '',
            minOrderAmount: v.minOrderAmount || 0,
            startDate: dtInput(v.startDate),
            endDate: dtInput(v.endDate),
            usageLimit: v.usageLimit || '',
            isActive: v.isActive !== false
        },
        showForm: true
    });

    closeForm = () => this.setState({ showForm: false });

    onField = (k) => (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({ form: { ...this.state.form, [k]: v } });
    };

    save = async () => {
        const f = this.state.form;
        if (!f.code || !f.type || f.value === '' || f.value === null) {
            toast.error('Thieu code / loai / gia tri');
            return;
        }
        const payload = {
            code: String(f.code).trim().toUpperCase(),
            description: f.description || null,
            type: f.type,
            value: parseInt(f.value, 10),
            maxDiscount: toInt(f.maxDiscount),
            minOrderAmount: toInt(f.minOrderAmount) || 0,
            startDate: f.startDate ? new Date(f.startDate).toISOString() : null,
            endDate: f.endDate ? new Date(f.endDate).toISOString() : null,
            usageLimit: toInt(f.usageLimit),
            isActive: !!f.isActive
        };
        try {
            const res = this.state.editing
                ? await updateVoucherService({ id: this.state.editing.id, ...payload })
                : await createVoucherService(payload);
            if (res && res.errCode === 0) {
                toast.success('Da luu');
                this.closeForm();
                this.load();
            } else {
                toast.error(res?.errMessage || 'Luu that bai');
            }
        } catch (e) { toast.error('Loi ket noi'); }
    };

    remove = async (v) => {
        if (!window.confirm(`Xoa voucher ${v.code}?`)) return;
        const res = await deleteVoucherService(v.id);
        if (res && res.errCode === 0) { toast.success('Da xoa'); this.load(); }
    };

    render() {
        const { items, loading, showForm, editing, form } = this.state;
        return (
            <div className="container-fluid" style={{ padding: 24 }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 style={{ margin: 0 }}><i className="fas fa-ticket-alt"></i> Quan ly voucher</h3>
                    <button className="btn btn-primary" onClick={this.openCreate}>
                        <i className="fas fa-plus"></i> Them voucher
                    </button>
                </div>

                {loading ? <div>Dang tai...</div> : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="thead-light">
                                <tr>
                                    <th>Code</th>
                                    <th>Mo ta</th>
                                    <th>Loai</th>
                                    <th>Gia tri</th>
                                    <th>Don toi thieu</th>
                                    <th>Luot dung</th>
                                    <th>Han</th>
                                    <th>Trang thai</th>
                                    <th style={{ width: 140 }}>Hanh dong</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr><td colSpan={9} className="text-center text-muted">Chua co voucher</td></tr>
                                )}
                                {items.map((v) => (
                                    <tr key={v.id}>
                                        <td><b>{v.code}</b></td>
                                        <td>{v.description || '-'}</td>
                                        <td>{v.type === 'percent' ? 'Phan tram' : 'Co dinh'}</td>
                                        <td>{v.type === 'percent' ? `${v.value}%` : `${Number(v.value).toLocaleString('vi-VN')}d`}</td>
                                        <td>{v.minOrderAmount ? Number(v.minOrderAmount).toLocaleString('vi-VN') + 'd' : '-'}</td>
                                        <td>{v.usedCount || 0}{v.usageLimit ? ` / ${v.usageLimit}` : ''}</td>
                                        <td style={{ fontSize: 12 }}>
                                            {v.startDate ? new Date(v.startDate).toLocaleDateString('vi-VN') : '-'}
                                            {' - '}
                                            {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${v.isActive ? 'success' : 'secondary'}`}>
                                                {v.isActive ? 'Bat' : 'Tat'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => this.openEdit(v)}>Sua</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => this.remove(v)}>Xoa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showForm && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
                    }}>
                        <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 540, maxWidth: '90%' }}>
                            <h4>{editing ? 'Sua voucher' : 'Them voucher'}</h4>
                            <div className="form-group">
                                <label>Code*</label>
                                <input className="form-control" value={form.code}
                                    disabled={!!editing}
                                    onChange={this.onField('code')} placeholder="VD: WELCOME10" />
                            </div>
                            <div className="form-group">
                                <label>Mo ta</label>
                                <input className="form-control" value={form.description} onChange={this.onField('description')} />
                            </div>
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label>Loai*</label>
                                    <select className="form-control" value={form.type} onChange={this.onField('type')}>
                                        <option value="fixed">Giam co dinh (VND)</option>
                                        <option value="percent">Giam theo phan tram (%)</option>
                                    </select>
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Gia tri*</label>
                                    <input type="number" className="form-control" value={form.value} onChange={this.onField('value')} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label>Don toi thieu (VND)</label>
                                    <input type="number" className="form-control" value={form.minOrderAmount} onChange={this.onField('minOrderAmount')} />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Giam toi da (neu %)</label>
                                    <input type="number" className="form-control" value={form.maxDiscount} onChange={this.onField('maxDiscount')} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label>Bat dau</label>
                                    <input type="datetime-local" className="form-control" value={form.startDate} onChange={this.onField('startDate')} />
                                </div>
                                <div className="form-group col-md-6">
                                    <label>Ket thuc</label>
                                    <input type="datetime-local" className="form-control" value={form.endDate} onChange={this.onField('endDate')} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-group col-md-6">
                                    <label>Gioi han luot dung</label>
                                    <input type="number" className="form-control" value={form.usageLimit} onChange={this.onField('usageLimit')} />
                                </div>
                                <div className="form-group col-md-6" style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
                                    <label style={{ marginBottom: 0 }}>
                                        <input type="checkbox" checked={!!form.isActive} onChange={this.onField('isActive')} /> Bat voucher
                                    </label>
                                </div>
                            </div>
                            <div className="d-flex justify-content-end" style={{ gap: 8 }}>
                                <button className="btn btn-secondary" onClick={this.closeForm}>Huy</button>
                                <button className="btn btn-primary" onClick={this.save}>Luu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({ userInfo: state.user.userInfo });
export default connect(mapStateToProps)(ManageVoucher);
