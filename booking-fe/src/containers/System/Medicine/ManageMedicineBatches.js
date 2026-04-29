import React, { Component } from 'react';
import {
    getMedicinesService,
    addMedicineBatchService,
    getMedicineBatchesService,
    deleteMedicineBatchService,
    getExpiringMedicinesService
} from '../../../services/userService';
import { toast } from 'react-toastify';
import './ManageMedicineBatches.scss';

class ManageMedicineBatches extends Component {
    constructor(props) {
        super(props);
        this.state = {
            medicines: [],
            selectedMedicineId: '',
            batches: [],
            expiring: [],
            form: { batchNo: '', expiryDate: '', manufactureDate: '', quantity: '', note: '' },
            loading: false,
            expiryDays: 30
        };
    }

    async componentDidMount() {
        await this.loadMedicines();
        await this.loadExpiring();
    }

    loadMedicines = async () => {
        try {
            const res = await getMedicinesService({ limit: 500 });
            if (res && res.errCode === 0) {
                this.setState({ medicines: res.data || [] });
            }
        } catch (e) { }
    };

    loadBatches = async (medicineId) => {
        if (!medicineId) { this.setState({ batches: [] }); return; }
        try {
            const res = await getMedicineBatchesService(medicineId);
            if (res && res.errCode === 0) {
                this.setState({ batches: res.data || [] });
            }
        } catch (e) { }
    };

    loadExpiring = async () => {
        try {
            const res = await getExpiringMedicinesService(this.state.expiryDays);
            if (res && res.errCode === 0) {
                this.setState({ expiring: res.data || [] });
            }
        } catch (e) { }
    };

    handleSelectMedicine = async (e) => {
        const id = e.target.value;
        this.setState({ selectedMedicineId: id });
        await this.loadBatches(id);
    };

    handleFormChange = (k, v) => {
        this.setState(s => ({ form: { ...s.form, [k]: v } }));
    };

    handleAddBatch = async () => {
        const { selectedMedicineId, form } = this.state;
        if (!selectedMedicineId) { toast.warn('Chon thuoc truoc'); return; }
        if (!form.batchNo || !form.expiryDate || !form.quantity) {
            toast.warn('Nhap du lo, HSD, so luong');
            return;
        }
        this.setState({ loading: true });
        try {
            const res = await addMedicineBatchService({
                medicineId: selectedMedicineId,
                batchNo: form.batchNo,
                expiryDate: form.expiryDate,
                manufactureDate: form.manufactureDate || null,
                quantity: Number(form.quantity),
                note: form.note || null
            });
            if (res && res.errCode === 0) {
                toast.success('Them lo thanh cong');
                this.setState({ form: { batchNo: '', expiryDate: '', manufactureDate: '', quantity: '', note: '' } });
                await this.loadBatches(selectedMedicineId);
                await this.loadExpiring();
                await this.loadMedicines();
            } else {
                toast.error(res?.errMessage || 'Loi');
            }
        } catch (e) { toast.error('Loi ket noi'); }
        finally { this.setState({ loading: false }); }
    };

    handleDeleteBatch = async (id) => {
        if (!window.confirm('Xoa lo nay? Ton kho se giam tuong ung.')) return;
        try {
            const res = await deleteMedicineBatchService(id);
            if (res && res.errCode === 0) {
                toast.success('Da xoa');
                await this.loadBatches(this.state.selectedMedicineId);
                await this.loadExpiring();
                await this.loadMedicines();
            }
        } catch (e) { toast.error('Loi'); }
    };

    daysUntil = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    };

    render() {
        const { medicines, selectedMedicineId, batches, expiring, form, loading, expiryDays } = this.state;
        return (
            <div className="manage-med-batches container">
                <h2>Quan ly lo thuoc & han su dung</h2>

                <div className="card expiring-card">
                    <div className="card-head">
                        <h4>Sap het han</h4>
                        <select value={expiryDays} onChange={async (e) => {
                            this.setState({ expiryDays: Number(e.target.value) }, this.loadExpiring);
                        }}>
                            <option value="7">7 ngay</option>
                            <option value="30">30 ngay</option>
                            <option value="60">60 ngay</option>
                            <option value="90">90 ngay</option>
                        </select>
                    </div>
                    {expiring.length === 0 ? (
                        <div className="empty">Khong co lo nao sap het han trong {expiryDays} ngay.</div>
                    ) : (
                        <table className="mb-table">
                            <thead>
                                <tr><th>Thuoc</th><th>Lo</th><th>HSD</th><th>Con lai</th><th>So luong</th></tr>
                            </thead>
                            <tbody>
                                {expiring.map(b => {
                                    const days = this.daysUntil(b.expiryDate);
                                    return (
                                        <tr key={b.id} className={days <= 7 ? 'critical' : days <= 30 ? 'warn' : ''}>
                                            <td>{b.medicineData?.name || '—'}</td>
                                            <td>{b.batchNo}</td>
                                            <td>{b.expiryDate}</td>
                                            <td><span className="days-left">{days} ngay</span></td>
                                            <td>{b.quantity}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="card">
                    <div className="card-head">
                        <h4>Them lo moi</h4>
                    </div>
                    <div className="form-row">
                        <select value={selectedMedicineId} onChange={this.handleSelectMedicine}>
                            <option value="">-- Chon thuoc --</option>
                            {medicines.map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.unit || ''}) - Ton: {m.stockQty}</option>
                            ))}
                        </select>
                        <input placeholder="So lo" value={form.batchNo}
                            onChange={e => this.handleFormChange('batchNo', e.target.value)} />
                        <input type="date" placeholder="HSD" value={form.expiryDate}
                            onChange={e => this.handleFormChange('expiryDate', e.target.value)} />
                        <input type="date" placeholder="Ngay SX" value={form.manufactureDate}
                            onChange={e => this.handleFormChange('manufactureDate', e.target.value)} />
                        <input type="number" min="1" placeholder="So luong" value={form.quantity}
                            onChange={e => this.handleFormChange('quantity', e.target.value)} />
                        <input placeholder="Ghi chu" value={form.note}
                            onChange={e => this.handleFormChange('note', e.target.value)} />
                        <button className="btn btn-primary" disabled={loading} onClick={this.handleAddBatch}>
                            {loading ? 'Dang luu...' : 'Them lo'}
                        </button>
                    </div>
                </div>

                {selectedMedicineId && (
                    <div className="card">
                        <div className="card-head">
                            <h4>Lo hien co</h4>
                        </div>
                        {batches.length === 0 ? (
                            <div className="empty">Chua co lo nao cho thuoc nay.</div>
                        ) : (
                            <table className="mb-table">
                                <thead>
                                    <tr><th>So lo</th><th>HSD</th><th>Ngay SX</th><th>So luong</th><th>Ghi chu</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {batches.map(b => {
                                        const days = this.daysUntil(b.expiryDate);
                                        return (
                                            <tr key={b.id} className={days < 0 ? 'expired' : days <= 30 ? 'warn' : ''}>
                                                <td>{b.batchNo}</td>
                                                <td>{b.expiryDate} {days < 0 ? <em>(Het han)</em> : null}</td>
                                                <td>{b.manufactureDate || '—'}</td>
                                                <td>{b.quantity}</td>
                                                <td>{b.note || '—'}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-danger"
                                                        onClick={() => this.handleDeleteBatch(b.id)}>
                                                        Xoa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default ManageMedicineBatches;
