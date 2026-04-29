import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
    getMedicinesService, createMedicineService,
    updateMedicineService, deleteMedicineService, adjustMedicineStockService,
    getStockMovementsService
} from '../../../services/userService';
import moment from 'moment';
import './ManageMedicine.scss';

const EMPTY = { name: '', unit: '', price: '', stockQty: 0, minStock: 0, usage: '', note: '', isActive: true };

class ManageMedicine extends Component {
    state = {
        items: [],
        q: '',
        editing: null,
        showForm: false,
        form: { ...EMPTY },
        loading: false,
        historyItem: null,
        movements: [],
        historyLoading: false
    };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const res = await getMedicinesService({ q: this.state.q });
            if (res && res.errCode === 0) this.setState({ items: res.data || [] });
        } catch (e) { }
        this.setState({ loading: false });
    };

    openCreate = () => this.setState({ editing: null, form: { ...EMPTY }, showForm: true });
    openEdit = (item) => this.setState({
        editing: item,
        form: {
            name: item.name || '',
            unit: item.unit || '',
            price: item.price || '',
            stockQty: item.stockQty || 0,
            minStock: item.minStock || 0,
            usage: item.usage || '',
            note: item.note || '',
            isActive: item.isActive !== false
        },
        showForm: true
    });
    closeForm = () => this.setState({ showForm: false, editing: null });

    onField = (k) => (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        this.setState({ form: { ...this.state.form, [k]: v } });
    };

    save = async () => {
        const { editing, form } = this.state;
        if (!form.name?.trim()) { toast.warning('Nhap ten thuoc'); return; }
        try {
            const res = editing
                ? await updateMedicineService({ id: editing.id, ...form })
                : await createMedicineService(form);
            if (res && res.errCode === 0) {
                toast.success(editing ? 'Cap nhat thanh cong' : 'Tao moi thanh cong');
                this.closeForm();
                this.load();
            } else {
                toast.error(res?.errMessage || 'Loi');
            }
        } catch (e) { toast.error('Loi ket noi'); }
    };

    remove = async (item) => {
        if (!window.confirm(`Xoa thuoc "${item.name}"?`)) return;
        const res = await deleteMedicineService(item.id);
        if (res && res.errCode === 0) { toast.success('Da xoa'); this.load(); }
        else toast.error(res?.errMessage || 'Loi');
    };

    adjust = async (item) => {
        const s = window.prompt(`Nhap so luong dieu chinh cho "${item.name}" (vd: +50 hoac -10):`);
        if (s === null) return;
        const delta = parseInt(s, 10);
        if (isNaN(delta)) { toast.warning('Gia tri khong hop le'); return; }
        const reason = window.prompt('Ly do (nhap hang moi/xuat kho):') || '';
        const res = await adjustMedicineStockService({ id: item.id, delta, reason });
        if (res && res.errCode === 0) { toast.success('Da cap nhat ton kho'); this.load(); }
        else toast.error(res?.errMessage || 'Loi');
    };

    openHistory = async (item) => {
        this.setState({ historyItem: item, historyLoading: true, movements: [] });
        try {
            const res = await getStockMovementsService({ medicineId: item.id, limit: 200 });
            if (res && res.errCode === 0) {
                this.setState({ movements: res.data || [] });
            }
        } catch (e) { /* ignore */ }
        this.setState({ historyLoading: false });
    };

    closeHistory = () => this.setState({ historyItem: null, movements: [], historyLoading: false });

    renderUserName = (u) => {
        if (!u) return 'He thong';
        const nm = `${u.lastName || ''} ${u.firstName || ''}`.trim();
        return nm || u.email || `#${u.id}`;
    };

    render() {
        const { items, q, showForm, form, editing, loading } = this.state;
        return (
            <div className="manage-medicine-container">
                <div className="mm-header">
                    <h3>Quan ly thuoc / Kho</h3>
                    <div className="mm-actions">
                        <input className="form-control" placeholder="Tim theo ten..."
                            value={q}
                            onChange={e => this.setState({ q: e.target.value })}
                            onKeyDown={e => { if (e.key === 'Enter') this.load(); }} />
                        <button className="btn btn-primary" onClick={this.load}>
                            <i className="fas fa-search"></i>
                        </button>
                        <button className="btn btn-success" onClick={this.openCreate}>
                            <i className="fas fa-plus"></i> Them thuoc
                        </button>
                    </div>
                </div>
                <div className="mm-table-wrap">
                    <table className="mm-table">
                        <thead>
                            <tr>
                                <th>Ten</th><th>Don vi</th><th>Gia</th>
                                <th>Ton kho</th><th>Min</th><th>Cach dung</th>
                                <th>Trang thai</th><th>Thao tac</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Dang tai...</td></tr>}
                            {!loading && items.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chua co thuoc</td></tr>}
                            {items.map(m => (
                                <tr key={m.id} className={Number(m.stockQty) <= Number(m.minStock) ? 'row-low' : ''}>
                                    <td>{m.name}</td>
                                    <td>{m.unit || ''}</td>
                                    <td>{Number(m.price).toLocaleString('vi-VN')}</td>
                                    <td>
                                        {m.stockQty}
                                        {Number(m.stockQty) <= Number(m.minStock) && (
                                            <span className="low-badge" title="Sap het">!</span>
                                        )}
                                    </td>
                                    <td>{m.minStock}</td>
                                    <td className="truncate">{m.usage || ''}</td>
                                    <td>{m.isActive ? 'Hoat dong' : 'Ngung'}</td>
                                    <td className="mm-actions-cell">
                                        <button className="btn-icon" title="Sua" onClick={() => this.openEdit(m)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn-icon" title="+/- ton" onClick={() => this.adjust(m)}>
                                            <i className="fas fa-boxes"></i>
                                        </button>
                                        <button className="btn-icon" title="Lich su xuat/nhap" onClick={() => this.openHistory(m)}>
                                            <i className="fas fa-history"></i>
                                        </button>
                                        <button className="btn-icon danger" title="Xoa" onClick={() => this.remove(m)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {showForm && (
                    <div className="mm-modal-overlay" onClick={this.closeForm}>
                        <div className="mm-modal" onClick={e => e.stopPropagation()}>
                            <div className="mm-modal-header">
                                <h4>{editing ? 'Cap nhat thuoc' : 'Them thuoc moi'}</h4>
                                <button className="btn-close-x" onClick={this.closeForm}>×</button>
                            </div>
                            <div className="mm-modal-body">
                                <div className="row">
                                    <div className="col-md-8 form-group">
                                        <label>Ten thuoc <span className="text-danger">*</span></label>
                                        <input className="form-control" value={form.name}
                                            onChange={this.onField('name')} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Don vi</label>
                                        <input className="form-control" placeholder="vien/hop/chai"
                                            value={form.unit} onChange={this.onField('unit')} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Gia (VND)</label>
                                        <input type="number" className="form-control" value={form.price}
                                            onChange={this.onField('price')} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Ton kho</label>
                                        <input type="number" className="form-control" value={form.stockQty}
                                            onChange={this.onField('stockQty')} />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Ton toi thieu</label>
                                        <input type="number" className="form-control" value={form.minStock}
                                            onChange={this.onField('minStock')} />
                                    </div>
                                    <div className="col-md-12 form-group">
                                        <label>Cach dung mac dinh</label>
                                        <input className="form-control" value={form.usage}
                                            onChange={this.onField('usage')} />
                                    </div>
                                    <div className="col-md-12 form-group">
                                        <label>Ghi chu</label>
                                        <textarea className="form-control" rows="2" value={form.note}
                                            onChange={this.onField('note')} />
                                    </div>
                                    <div className="col-md-12 form-group form-check">
                                        <input type="checkbox" className="form-check-input" id="mmActive"
                                            checked={form.isActive} onChange={this.onField('isActive')} />
                                        <label className="form-check-label" htmlFor="mmActive">Dang hoat dong</label>
                                    </div>
                                </div>
                            </div>
                            <div className="mm-modal-footer">
                                <button className="btn btn-secondary" onClick={this.closeForm}>Huy</button>
                                <button className="btn btn-primary" onClick={this.save}>
                                    {editing ? 'Cap nhat' : 'Tao moi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {this.state.historyItem && (
                    <div className="mm-modal-overlay" onClick={this.closeHistory}>
                        <div className="mm-modal mm-history-modal" onClick={e => e.stopPropagation()}>
                            <div className="mm-modal-header">
                                <h4>Lich su xuat/nhap: {this.state.historyItem.name}</h4>
                                <button className="btn-close-x" onClick={this.closeHistory}>×</button>
                            </div>
                            <div className="mm-modal-body">
                                {this.state.historyLoading && <div className="text-center py-3">Dang tai...</div>}
                                {!this.state.historyLoading && this.state.movements.length === 0 && (
                                    <div className="text-center py-3 text-muted">Chua co giao dich</div>
                                )}
                                {!this.state.historyLoading && this.state.movements.length > 0 && (
                                    <table className="mm-table">
                                        <thead>
                                            <tr>
                                                <th>Thoi gian</th>
                                                <th>Thay doi</th>
                                                <th>Truoc -&gt; Sau</th>
                                                <th>Ly do</th>
                                                <th>Nguoi thuc hien</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.movements.map(mv => (
                                                <tr key={mv.id}>
                                                    <td>{mv.createdAt ? moment(mv.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                                    <td className={mv.delta > 0 ? 'text-success' : 'text-danger'}>
                                                        <b>{mv.delta > 0 ? `+${mv.delta}` : mv.delta}</b>
                                                    </td>
                                                    <td>{mv.prevQty} -&gt; {mv.newQty}</td>
                                                    <td className="truncate" title={mv.reason || ''}>{mv.reason || '-'}</td>
                                                    <td>{this.renderUserName(mv.userData)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="mm-modal-footer">
                                <button className="btn btn-secondary" onClick={this.closeHistory}>Dong</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({ language: state.app.language });
export default connect(mapStateToProps)(ManageMedicine);
