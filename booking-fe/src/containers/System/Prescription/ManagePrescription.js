import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManagePrescription.scss';
import Select from 'react-select';
import DatePicker from '../../../components/Input/DatePicker';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import {
    getAllPrescriptions, createPrescription, deletePrescription,
    getPatientPrescriptionHistory, sendPrescriptionEmail,
    getMedicinesService, adjustMedicineStockService
} from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ManagePrescription extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Filter
            listDoctors: [],
            selectedDoctor: '',
            currentDate: moment(new Date()).startOf('day').valueOf(),

            // Prescription list
            prescriptions: [],
            isShowLoading: false,

            // Create form
            isShowCreateForm: false,
            patientName: '',
            patientEmail: '',
            patientPhone: '',
            diagnosis: '',
            note: '',
            medicines: [{ name: '', medicineId: null, dosage: '', usage: '', quantity: '', unit: 'viên', price: 0 }],

            // Medicine autocomplete
            suggestions: [],
            activeSuggestIdx: null,

            // History modal
            isShowHistory: false,
            historyData: [],
            historyPatientName: '',

            // Pagination
            currentPage: 1,
            itemsPerPage: 10
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        await this.loadPrescriptions();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDoctorSelect(this.props.allDoctors);
            this.setState({ listDoctors: dataSelect });
        }
    }

    buildDoctorSelect = (inputData) => {
        let result = [{ label: '-- Tất cả bác sĩ --', value: '' }];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            inputData.forEach((item) => {
                let labelVi = `${item.lastName} ${item.firstName}`;
                let labelEn = `${item.firstName} ${item.lastName}`;
                result.push({
                    label: language === LANGUAGES.VI ? labelVi : labelEn,
                    value: item.id
                });
            });
        }
        return result;
    }

    loadPrescriptions = async () => {
        this.setState({ isShowLoading: true });
        let { currentDate, selectedDoctor } = this.state;
        try {
            let res = await getAllPrescriptions({
                doctorId: selectedDoctor ? selectedDoctor.value || '' : '',
                patientId: '',
                date: new Date(currentDate).getTime()
            });
            if (res && res.errCode === 0) {
                this.setState({ prescriptions: res.data || [], isShowLoading: false });
            } else {
                this.setState({ prescriptions: [], isShowLoading: false });
            }
        } catch (e) {
            this.setState({ prescriptions: [], isShowLoading: false });
        }
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({ currentDate: date[0], currentPage: 1 }, async () => {
            await this.loadPrescriptions();
        });
    }

    handleChangeDoctor = (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption, currentPage: 1 }, async () => {
            await this.loadPrescriptions();
        });
    }

    // ========== CREATE FORM ==========
    toggleCreateForm = () => {
        this.setState(prev => ({
            isShowCreateForm: !prev.isShowCreateForm,
            patientName: '',
            patientEmail: '',
            patientPhone: '',
            diagnosis: '',
            note: '',
            medicines: [{ name: '', medicineId: null, dosage: '', usage: '', quantity: '', unit: 'viên', price: 0 }],
            suggestions: [],
            activeSuggestIdx: null
        }));
    }

    handleInputChange = (event, field) => {
        this.setState({ [field]: event.target.value });
    }

    handleMedicineChange = (index, field, value) => {
        let medicines = [...this.state.medicines];
        medicines[index][field] = value;
        if (field === 'name') {
            medicines[index].medicineId = null;
        }
        this.setState({ medicines });
    }

    handleMedicineNameChange = (index, value) => {
        this.handleMedicineChange(index, 'name', value);
        this.setState({ activeSuggestIdx: index });
        clearTimeout(this._medSearchTimer);
        this._medSearchTimer = setTimeout(async () => {
            const q = (value || '').trim();
            if (!q) { this.setState({ suggestions: [] }); return; }
            try {
                const res = await getMedicinesService({ q, activeOnly: 1, limit: 10 });
                if (res && res.errCode === 0) {
                    this.setState({ suggestions: res.data || [] });
                } else {
                    this.setState({ suggestions: [] });
                }
            } catch (e) {
                this.setState({ suggestions: [] });
            }
        }, 250);
    }

    handlePickSuggestion = (index, med) => {
        let medicines = [...this.state.medicines];
        medicines[index] = {
            ...medicines[index],
            medicineId: med.id,
            name: med.name,
            unit: med.unit || medicines[index].unit,
            usage: med.usage || medicines[index].usage,
            price: Number(med.price) || 0
        };
        this.setState({ medicines, suggestions: [], activeSuggestIdx: null });
    }

    hideSuggestions = () => {
        this._hideTimer = setTimeout(() => {
            this.setState({ suggestions: [], activeSuggestIdx: null });
        }, 180);
    }

    addMedicineLine = () => {
        this.setState(prev => ({
            medicines: [...prev.medicines, { name: '', medicineId: null, dosage: '', usage: '', quantity: '', unit: 'viên', price: 0 }]
        }));
    }

    removeMedicineLine = (index) => {
        if (this.state.medicines.length <= 1) return;
        let medicines = [...this.state.medicines];
        medicines.splice(index, 1);
        this.setState({ medicines });
    }

    handleSavePrescription = async () => {
        let { patientName, patientEmail, diagnosis, medicines, selectedDoctor, note } = this.state;

        if (!patientName) { toast.error('Vui lòng nhập tên bệnh nhân!'); return; }
        if (!diagnosis) { toast.error('Vui lòng nhập chẩn đoán!'); return; }
        if (!medicines[0].name) { toast.error('Vui lòng nhập ít nhất 1 thuốc!'); return; }

        this.setState({ isShowLoading: true });
        try {
            let res = await createPrescription({
                doctorId: selectedDoctor ? selectedDoctor.value : '',
                patientName,
                patientEmail,
                patientPhone: this.state.patientPhone,
                diagnosis,
                note,
                medicines: medicines.filter(m => m.name),
                date: new Date(this.state.currentDate).getTime()
            });
            if (res && res.errCode === 0) {
                toast.success('Tạo đơn thuốc thành công!');

                const toDeduct = medicines.filter(m => m.medicineId && Number(m.quantity) > 0);
                if (toDeduct.length > 0) {
                    const results = await Promise.allSettled(toDeduct.map(m =>
                        adjustMedicineStockService({
                            id: m.medicineId,
                            delta: -Number(m.quantity),
                            reason: `Ke don thuoc cho ${patientName}`
                        })
                    ));
                    const failed = results.filter(r =>
                        r.status === 'rejected' || (r.value && r.value.errCode !== 0)
                    ).length;
                    if (failed > 0) {
                        toast.warning(`${failed} thuoc khong tru kho duoc (co the am kho hoac loi).`);
                    }
                }

                this.toggleCreateForm();
                await this.loadPrescriptions();
            } else {
                toast.error('Tạo đơn thuốc thất bại!');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Tạo đơn thuốc thất bại!');
            this.setState({ isShowLoading: false });
        }
    }

    // ========== DELETE ==========
    handleDeletePrescription = async (item) => {
        if (window.confirm('Bạn có chắc muốn xóa đơn thuốc này?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await deletePrescription(item.id);
                if (res && res.errCode === 0) {
                    toast.success('Xóa đơn thuốc thành công!');
                    await this.loadPrescriptions();
                } else {
                    toast.error('Xóa thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Xóa thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    // ========== HISTORY ==========
    handleViewHistory = async (item) => {
        this.setState({ isShowLoading: true });
        try {
            let res = await getPatientPrescriptionHistory(item.patientId || item.id);
            if (res && res.errCode === 0) {
                this.setState({
                    isShowHistory: true,
                    historyData: res.data || [],
                    historyPatientName: item.patientName || item.patientData?.firstName || '',
                    isShowLoading: false
                });
            } else {
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            this.setState({ isShowLoading: false });
        }
    }

    closeHistory = () => {
        this.setState({ isShowHistory: false, historyData: [], historyPatientName: '' });
    }

    // ========== PRINT ==========
    handlePrintPrescription = (item) => {
        const esc = (v) => String(v == null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const medicines = item.medicines || item.prescriptionDetails || [];
        const dateLabel = item.date ? moment(+item.date).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY');
        const printContent = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><title>Đơn thuốc - ${esc(item.patientName || '')}</title>
<style>
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2236; margin: 0; padding: 0; font-size: 14px; line-height: 1.5; }
    .clinic-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f8cff; padding-bottom: 12px; margin-bottom: 16px; }
    .clinic-brand { font-size: 22px; font-weight: 700; color: #4f8cff; letter-spacing: 0.5px; }
    .clinic-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .clinic-meta { text-align: right; font-size: 12px; color: #6b7280; }
    .doc-title { text-align: center; font-size: 24px; font-weight: 700; margin: 14px 0 20px; letter-spacing: 2px; }
    .info-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 14px; }
    .info-col { flex: 1; }
    .info-row { margin: 4px 0; font-size: 14px; }
    .info-row b { display: inline-block; min-width: 92px; color: #374151; font-weight: 600; }
    .diagnosis-box { background: #f5f7fa; border-left: 3px solid #4f8cff; padding: 10px 12px; margin: 14px 0; border-radius: 3px; }
    .diagnosis-box b { color: #1a2236; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #d0d7de; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #eaf0f6; color: #1a2236; font-weight: 600; }
    td.c { text-align: center; }
    .note-box { background: #fffbe6; border-left: 3px solid #f59e0b; padding: 8px 10px; margin-top: 14px; font-size: 13px; color: #92400e; border-radius: 3px; }
    .signature { margin-top: 40px; display: flex; justify-content: flex-end; }
    .signature-block { text-align: center; min-width: 220px; }
    .signature-block .role { font-size: 12px; color: #6b7280; font-style: italic; }
    .signature-block .name { font-weight: 700; margin-top: 50px; border-top: 1px dashed #6b7280; padding-top: 6px; }
    .footer-note { margin-top: 30px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #eef2f7; padding-top: 8px; }
    @media print { .no-print { display: none !important; } body { background: white; } }
</style></head><body>
    <div class="clinic-header">
        <div>
            <div class="clinic-brand">BOOKINGCARE</div>
            <div class="clinic-sub">Phòng khám đa khoa - Chăm sóc sức khỏe thông minh</div>
            <div class="clinic-sub">Hotline: 1900 1234 &nbsp;·&nbsp; www.bookingcare.vn</div>
        </div>
        <div class="clinic-meta">
            <div>Mã đơn: #${esc(item.id || '')}</div>
            <div>Ngày kê: ${dateLabel}</div>
        </div>
    </div>

    <div class="doc-title">ĐƠN THUỐC</div>

    <div class="info-grid">
        <div class="info-col">
            <div class="info-row"><b>Họ tên BN:</b> ${esc(item.patientName || '')}</div>
            <div class="info-row"><b>Điện thoại:</b> ${esc(item.patientPhone || '')}</div>
            <div class="info-row"><b>Email:</b> ${esc(item.patientEmail || '')}</div>
        </div>
        <div class="info-col">
            <div class="info-row"><b>Bác sĩ:</b> ${esc(item.doctorName || '')}</div>
            <div class="info-row"><b>Ngày khám:</b> ${dateLabel}</div>
        </div>
    </div>

    <div class="diagnosis-box"><b>Chẩn đoán:</b> ${esc(item.diagnosis || '')}</div>

    <table>
        <thead>
            <tr><th style="width:40px" class="c">STT</th><th>Tên thuốc</th><th>Liều dùng</th><th>Cách dùng</th><th class="c" style="width:80px">SL</th><th class="c" style="width:70px">ĐV</th></tr>
        </thead>
        <tbody>
            ${medicines.length > 0
                ? medicines.map((m, i) => `<tr><td class="c">${i + 1}</td><td><b>${esc(m.name || '')}</b></td><td>${esc(m.dosage || '')}</td><td>${esc(m.usage || '')}</td><td class="c">${esc(m.quantity || '')}</td><td class="c">${esc(m.unit || '')}</td></tr>`).join('')
                : '<tr><td colspan="6" class="c" style="color:#999">Không có thuốc</td></tr>'
            }
        </tbody>
    </table>

    ${item.note ? `<div class="note-box"><b>Ghi chú:</b> ${esc(item.note)}</div>` : ''}

    <div class="signature">
        <div class="signature-block">
            <div class="role">Bác sĩ khám và kê đơn</div>
            <div class="name">${esc(item.doctorName || '')}</div>
        </div>
    </div>

    <div class="footer-note">Đơn thuốc có giá trị trong vòng 05 ngày kể từ ngày kê. Giữ đơn để tiện theo dõi và tái khám.</div>

    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 100); };</script>
</body></html>`;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // ========== SEND EMAIL ==========
    handleSendEmailPrescription = async (item) => {
        if (!window.confirm(`Gui don thuoc nay toi email benh nhan "${item.patientName || ''}"?`)) return;
        this.setState({ isShowLoading: true });
        try {
            const res = await sendPrescriptionEmail({
                prescriptionId: item.id,
                language: this.props.language
            });
            if (res && res.errCode === 0) {
                toast.success(`Da gui don thuoc den ${res.to || 'benh nhan'}`);
            } else {
                toast.error(res?.errMessage || 'Gui email that bai');
            }
        } catch (e) {
            toast.error('Loi ket noi');
        } finally {
            this.setState({ isShowLoading: false });
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    render() {
        let { language } = this.props;
        let {
            listDoctors, prescriptions, isShowLoading, isShowCreateForm,
            medicines, isShowHistory, historyData, historyPatientName,
            currentPage, itemsPerPage
        } = this.state;

        // Pagination
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = prescriptions.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(prescriptions.length / itemsPerPage);

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="manage-prescription-container">
                    <div className="mp-title">Quản lý đơn thuốc</div>

                    {/* Filter */}
                    <div className="mp-filter row">
                        <div className="col-3 form-group">
                            <label>Chọn ngày</label>
                            <DatePicker
                                onChange={this.handleOnchangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                            />
                        </div>
                        <div className="col-3 form-group">
                            <label>Bác sĩ</label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeDoctor}
                                options={listDoctors}
                                placeholder="-- Tất cả bác sĩ --"
                            />
                        </div>
                        <div className="col-3 form-group d-flex align-items-end">
                            <button className="btn btn-primary mr-2" onClick={this.loadPrescriptions}>
                                <i className="fas fa-search"></i> Tìm kiếm
                            </button>
                            <button className="btn btn-success" onClick={this.toggleCreateForm}>
                                <i className="fas fa-plus"></i> Tạo đơn thuốc
                            </button>
                        </div>
                    </div>

                    {/* Create Form */}
                    {isShowCreateForm && (
                        <div className="mp-create-form">
                            <div className="form-title">Kê đơn thuốc mới</div>
                            <div className="row">
                                <div className="col-4 form-group">
                                    <label>Tên bệnh nhân *</label>
                                    <input className="form-control" value={this.state.patientName}
                                        onChange={(e) => this.handleInputChange(e, 'patientName')} />
                                </div>
                                <div className="col-4 form-group">
                                    <label>Email</label>
                                    <input className="form-control" value={this.state.patientEmail}
                                        onChange={(e) => this.handleInputChange(e, 'patientEmail')} />
                                </div>
                                <div className="col-4 form-group">
                                    <label>Số điện thoại</label>
                                    <input className="form-control" value={this.state.patientPhone}
                                        onChange={(e) => this.handleInputChange(e, 'patientPhone')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label>Chẩn đoán *</label>
                                    <input className="form-control" value={this.state.diagnosis}
                                        onChange={(e) => this.handleInputChange(e, 'diagnosis')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label>Ghi chú</label>
                                    <input className="form-control" value={this.state.note}
                                        onChange={(e) => this.handleInputChange(e, 'note')} />
                                </div>
                            </div>

                            <div className="medicine-section">
                                <div className="medicine-header">
                                    <span>Danh sách thuốc</span>
                                    <button className="btn btn-sm btn-info" onClick={this.addMedicineLine}>
                                        <i className="fas fa-plus"></i> Thêm thuốc
                                    </button>
                                </div>
                                <table className="medicine-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Tên thuốc *</th>
                                            <th>Liều dùng</th>
                                            <th>Cách dùng</th>
                                            <th>Số lượng</th>
                                            <th>Đơn vị</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map((med, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td className="med-name-cell">
                                                    <input className="form-control form-control-sm"
                                                        value={med.name}
                                                        onFocus={() => this.setState({ activeSuggestIdx: idx })}
                                                        onBlur={this.hideSuggestions}
                                                        onChange={(e) => this.handleMedicineNameChange(idx, e.target.value)} />
                                                    {med.medicineId && (
                                                        <span className="med-linked-badge" title="Da lien ket voi kho thuoc">
                                                            <i className="fas fa-link"></i>
                                                        </span>
                                                    )}
                                                    {this.state.activeSuggestIdx === idx && this.state.suggestions.length > 0 && (
                                                        <ul className="med-suggest-list"
                                                            onMouseDown={(e) => e.preventDefault()}>
                                                            {this.state.suggestions.map(s => (
                                                                <li key={s.id}
                                                                    className={s.stockQty <= s.minStock ? 'low-stock' : ''}
                                                                    onClick={() => this.handlePickSuggestion(idx, s)}>
                                                                    <span className="ms-name">{s.name}</span>
                                                                    <span className="ms-meta">
                                                                        {s.unit || ''} · ton: {s.stockQty}
                                                                        {s.stockQty <= s.minStock ? ' (sap het)' : ''}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td>
                                                    <input className="form-control form-control-sm"
                                                        placeholder="VD: 2 lần/ngày"
                                                        value={med.dosage}
                                                        onChange={(e) => this.handleMedicineChange(idx, 'dosage', e.target.value)} />
                                                </td>
                                                <td>
                                                    <input className="form-control form-control-sm"
                                                        placeholder="VD: Sau ăn"
                                                        value={med.usage}
                                                        onChange={(e) => this.handleMedicineChange(idx, 'usage', e.target.value)} />
                                                </td>
                                                <td>
                                                    <input className="form-control form-control-sm" type="number"
                                                        value={med.quantity}
                                                        onChange={(e) => this.handleMedicineChange(idx, 'quantity', e.target.value)} />
                                                </td>
                                                <td>
                                                    <select className="form-control form-control-sm"
                                                        value={med.unit}
                                                        onChange={(e) => this.handleMedicineChange(idx, 'unit', e.target.value)}>
                                                        <option value="viên">Viên</option>
                                                        <option value="gói">Gói</option>
                                                        <option value="chai">Chai</option>
                                                        <option value="ống">Ống</option>
                                                        <option value="hộp">Hộp</option>
                                                        <option value="tuýp">Tuýp</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <button className="btn btn-sm btn-danger"
                                                        onClick={() => this.removeMedicineLine(idx)}
                                                        disabled={medicines.length <= 1}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={this.handleSavePrescription}>
                                    <i className="fas fa-save"></i> Lưu đơn thuốc
                                </button>
                                <button className="btn btn-secondary" onClick={this.toggleCreateForm}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Prescription List */}
                    <div className="mp-table">
                        <table id="TablePrescription">
                            <tbody>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Chẩn đoán</th>
                                    <th>Số thuốc</th>
                                    <th>Hành động</th>
                                </tr>
                                {currentItems && currentItems.length > 0 ? (
                                    currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{indexOfFirst + index + 1}</td>
                                            <td>{item.date ? moment(+item.date).format('DD/MM/YYYY') : ''}</td>
                                            <td>{item.patientName || ''}</td>
                                            <td>{item.doctorName || ''}</td>
                                            <td>{item.diagnosis || ''}</td>
                                            <td>{item.medicineCount || (item.medicines ? item.medicines.length : 0)}</td>
                                            <td className="action-col">
                                                <button className="btn-action btn-print" title="In đơn thuốc"
                                                    onClick={() => this.handlePrintPrescription(item)}>
                                                    <i className="fas fa-print"></i>
                                                </button>
                                                <button className="btn-action btn-email" title="Gửi email cho bệnh nhân"
                                                    onClick={() => this.handleSendEmailPrescription(item)}>
                                                    <i className="fas fa-envelope"></i>
                                                </button>
                                                <button className="btn-action btn-history" title="Lịch sử BN"
                                                    onClick={() => this.handleViewHistory(item)}>
                                                    <i className="fas fa-history"></i>
                                                </button>
                                                <button className="btn-action btn-delete-rx" title="Xóa"
                                                    onClick={() => this.handleDeletePrescription(item)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>Không có đơn thuốc nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="prescription-pagination">
                            <button disabled={currentPage === 1}
                                onClick={() => this.handlePageChange(currentPage - 1)}>&laquo;</button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => this.handlePageChange(i + 1)}>{i + 1}</button>
                            ))}
                            <button disabled={currentPage === totalPages}
                                onClick={() => this.handlePageChange(currentPage + 1)}>&raquo;</button>
                        </div>
                    )}

                    {/* History Modal */}
                    {isShowHistory && (
                        <div className="history-overlay">
                            <div className="history-modal">
                                <div className="history-header">
                                    <span>Lịch sử đơn thuốc - {historyPatientName}</span>
                                    <button onClick={this.closeHistory}><i className="fas fa-times"></i></button>
                                </div>
                                <div className="history-body">
                                    {historyData.length > 0 ? (
                                        historyData.map((rx, idx) => (
                                            <div className="history-item" key={idx}>
                                                <div className="history-date">
                                                    <strong>{rx.date ? moment(+rx.date).format('DD/MM/YYYY') : ''}</strong>
                                                    {' - '}BS: {rx.doctorName || ''}
                                                    {' - '}Chẩn đoán: {rx.diagnosis || ''}
                                                </div>
                                                <ul>
                                                    {(rx.medicines || []).map((m, mi) => (
                                                        <li key={mi}>
                                                            {m.name} - {m.dosage} - {m.usage} - SL: {m.quantity} {m.unit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Chưa có lịch sử đơn thuốc.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        allDoctors: state.admin.allDoctors,
        user: state.user.userInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePrescription);
