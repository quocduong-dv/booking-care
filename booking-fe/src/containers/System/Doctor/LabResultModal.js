import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {
    createLabResultService,
    getLabResultsByBookingService,
    deleteLabResultService
} from '../../../services/userService';
import { toast } from 'react-toastify';
import './LabResultModal.scss';

class LabResultModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            loading: false,
            form: { testType: '', testDate: '', resultText: '', fileUrl: '', fileName: '', notes: '' }
        };
    }

    async componentDidMount() {
        if (this.props.isOpen) await this.load();
    }

    async componentDidUpdate(prev) {
        if (!prev.isOpen && this.props.isOpen) await this.load();
    }

    load = async () => {
        const { bookingId } = this.props;
        if (!bookingId) return;
        this.setState({ loading: true });
        try {
            const res = await getLabResultsByBookingService(bookingId);
            if (res && res.errCode === 0) {
                this.setState({ items: res.data || [], loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) { this.setState({ loading: false }); }
    };

    handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 3 * 1024 * 1024) {
            toast.warn('File toi da 3MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            this.setState(s => ({
                form: { ...s.form, fileUrl: reader.result, fileName: f.name }
            }));
        };
        reader.readAsDataURL(f);
    };

    handleChange = (k, v) => {
        this.setState(s => ({ form: { ...s.form, [k]: v } }));
    };

    handleCreate = async () => {
        const { bookingId, patientId } = this.props;
        const { form } = this.state;
        if (!form.testType) { toast.warn('Nhap loai xet nghiem'); return; }
        try {
            const res = await createLabResultService({
                bookingId,
                patientId,
                testType: form.testType,
                testDate: form.testDate || null,
                resultText: form.resultText || null,
                fileUrl: form.fileUrl || null,
                fileName: form.fileName || null,
                notes: form.notes || null
            });
            if (res && res.errCode === 0) {
                toast.success('Da luu ket qua');
                this.setState({
                    form: { testType: '', testDate: '', resultText: '', fileUrl: '', fileName: '', notes: '' }
                });
                await this.load();
            } else {
                toast.error(res?.errMessage || 'Loi');
            }
        } catch (e) { toast.error('Loi ket noi'); }
    };

    handleDelete = async (id) => {
        if (!window.confirm('Xoa ket qua nay?')) return;
        try {
            const res = await deleteLabResultService(id);
            if (res && res.errCode === 0) {
                toast.success('Da xoa');
                this.load();
            }
        } catch (e) { toast.error('Loi'); }
    };

    render() {
        const { isOpen, toggle, readonly } = this.props;
        const { items, loading, form } = this.state;
        return (
            <Modal isOpen={isOpen} toggle={toggle} size="lg" className="lab-result-modal">
                <ModalHeader toggle={toggle}>Ket qua xet nghiem</ModalHeader>
                <ModalBody>
                    {loading ? <div className="loading">Dang tai...</div> : (
                        <div className="list">
                            {items.length === 0 && <div className="empty">Chua co ket qua nao.</div>}
                            {items.map(it => (
                                <div className="item" key={it.id}>
                                    <div className="top">
                                        <strong>{it.testType}</strong>
                                        <span className="date">{it.testDate || new Date(it.createdAt).toLocaleDateString('vi-VN')}</span>
                                        {!readonly && (
                                            <button className="btn btn-sm btn-outline-danger"
                                                onClick={() => this.handleDelete(it.id)}>Xoa</button>
                                        )}
                                    </div>
                                    {it.resultText && <div className="text">{it.resultText}</div>}
                                    {it.fileUrl && (
                                        <div className="file">
                                            <a href={it.fileUrl} target="_blank" rel="noopener noreferrer"
                                                download={it.fileName || 'lab'}>
                                                <i className="fas fa-file-download"></i> {it.fileName || 'Tai file'}
                                            </a>
                                        </div>
                                    )}
                                    {it.notes && <div className="notes"><i>Ghi chu: {it.notes}</i></div>}
                                    {it.doctorData && (
                                        <div className="doctor">
                                            BS: {it.doctorData.lastName} {it.doctorData.firstName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!readonly && (
                        <div className="create-form">
                            <h5>Them ket qua moi</h5>
                            <div className="grid">
                                <input placeholder="Loai xet nghiem (vd: Sinh hoa, XQ...)" value={form.testType}
                                    onChange={e => this.handleChange('testType', e.target.value)} />
                                <input type="date" value={form.testDate}
                                    onChange={e => this.handleChange('testDate', e.target.value)} />
                            </div>
                            <textarea placeholder="Ket qua / chi so" value={form.resultText} rows={3}
                                onChange={e => this.handleChange('resultText', e.target.value)} />
                            <input type="file" accept="image/*,.pdf" onChange={this.handleFile} />
                            {form.fileName && <small>Da chon: {form.fileName}</small>}
                            <textarea placeholder="Ghi chu" value={form.notes} rows={2}
                                onChange={e => this.handleChange('notes', e.target.value)} />
                            <button className="btn btn-primary" onClick={this.handleCreate}>Luu</button>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggle}>Dong</button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default LabResultModal;
