import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import {
    saveEmrService,
    getEmrByBookingService
} from '../../../services/userService';
import './EmrModal.scss';

const EMPTY_VITALS = {
    bloodPressure: '',
    pulse: '',
    temperature: '',
    weight: '',
    height: ''
};

const parseVitals = (raw) => {
    if (!raw) return { ...EMPTY_VITALS };
    try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return { ...EMPTY_VITALS, ...(obj || {}) };
    } catch (e) {
        return { ...EMPTY_VITALS };
    }
};

class EmrModal extends Component {
    state = {
        loading: false,
        saving: false,
        exists: false,
        bookingInfo: null,
        chiefComplaint: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        vitals: { ...EMPTY_VITALS }
    };

    async componentDidMount() {
        if (this.props.isOpen && this.props.bookingId) {
            await this.load();
        }
    }

    async componentDidUpdate(prev) {
        if (this.props.isOpen && !prev.isOpen && this.props.bookingId) {
            await this.load();
        }
        if (this.props.bookingId !== prev.bookingId && this.props.isOpen) {
            await this.load();
        }
    }

    load = async () => {
        const { bookingId } = this.props;
        if (!bookingId) return;
        this.setState({ loading: true });
        try {
            const res = await getEmrByBookingService(bookingId);
            if (res && res.errCode === 0) {
                const d = res.data;
                this.setState({
                    exists: !!d,
                    bookingInfo: res.booking || null,
                    chiefComplaint: d?.chiefComplaint || '',
                    symptoms: d?.symptoms || '',
                    diagnosis: d?.diagnosis || '',
                    treatment: d?.treatment || '',
                    notes: d?.notes || '',
                    vitals: parseVitals(d?.vitalSigns),
                    loading: false
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    onField = (field) => (ev) => this.setState({ [field]: ev.target.value });

    onVital = (field) => (ev) => this.setState({
        vitals: { ...this.state.vitals, [field]: ev.target.value }
    });

    onSave = async () => {
        const { bookingId, patientId, doctorId, onSaved } = this.props;
        const {
            chiefComplaint, symptoms, diagnosis, treatment, notes, vitals
        } = this.state;

        if (!diagnosis.trim()) {
            toast.warn('Vui long nhap chan doan');
            return;
        }

        this.setState({ saving: true });
        try {
            const res = await saveEmrService({
                bookingId,
                patientId,
                doctorId,
                chiefComplaint: chiefComplaint.trim(),
                symptoms: symptoms.trim(),
                diagnosis: diagnosis.trim(),
                treatment: treatment.trim(),
                notes: notes.trim(),
                vitalSigns: vitals
            });
            if (res && res.errCode === 0) {
                toast.success('Luu ho so kham thanh cong');
                this.setState({ saving: false, exists: true });
                if (onSaved) onSaved(res.data);
                if (this.props.toggle) this.props.toggle();
            } else {
                this.setState({ saving: false });
                toast.error(res?.errMessage || 'Khong luu duoc');
            }
        } catch (e) {
            this.setState({ saving: false });
            toast.error('Loi ket noi');
        }
    };

    render() {
        const { isOpen, toggle, readonly } = this.props;
        const {
            loading, saving, exists,
            chiefComplaint, symptoms, diagnosis, treatment, notes, vitals
        } = this.state;

        const title = readonly
            ? 'Ho so kham benh'
            : (exists ? 'Cap nhat ho so kham' : 'Tao ho so kham');

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered size="lg" className="emr-modal">
                <ModalHeader toggle={toggle}>{title}</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <div className="text-center p-4">Dang tai...</div>
                    ) : (
                        <div className="emr-form">
                            <div className="section-title">Sinh hieu</div>
                            <div className="row">
                                <div className="col-md-4 form-group">
                                    <label>Huyet ap</label>
                                    <input type="text" className="form-control" placeholder="120/80"
                                        value={vitals.bloodPressure}
                                        onChange={this.onVital('bloodPressure')}
                                        disabled={readonly} />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Mach (lan/phut)</label>
                                    <input type="text" className="form-control"
                                        value={vitals.pulse}
                                        onChange={this.onVital('pulse')}
                                        disabled={readonly} />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Nhiet do (°C)</label>
                                    <input type="text" className="form-control"
                                        value={vitals.temperature}
                                        onChange={this.onVital('temperature')}
                                        disabled={readonly} />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Can nang (kg)</label>
                                    <input type="text" className="form-control"
                                        value={vitals.weight}
                                        onChange={this.onVital('weight')}
                                        disabled={readonly} />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Chieu cao (cm)</label>
                                    <input type="text" className="form-control"
                                        value={vitals.height}
                                        onChange={this.onVital('height')}
                                        disabled={readonly} />
                                </div>
                            </div>

                            <div className="section-title">Lam sang</div>
                            <div className="form-group">
                                <label>Ly do den kham</label>
                                <textarea className="form-control" rows="2"
                                    value={chiefComplaint}
                                    onChange={this.onField('chiefComplaint')}
                                    disabled={readonly} />
                            </div>
                            <div className="form-group">
                                <label>Trieu chung</label>
                                <textarea className="form-control" rows="3"
                                    value={symptoms}
                                    onChange={this.onField('symptoms')}
                                    disabled={readonly} />
                            </div>
                            <div className="form-group">
                                <label>Chan doan <span className="text-danger">*</span></label>
                                <textarea className="form-control" rows="2"
                                    value={diagnosis}
                                    onChange={this.onField('diagnosis')}
                                    disabled={readonly} />
                            </div>
                            <div className="form-group">
                                <label>Huong dieu tri</label>
                                <textarea className="form-control" rows="3"
                                    value={treatment}
                                    onChange={this.onField('treatment')}
                                    disabled={readonly} />
                            </div>
                            <div className="form-group">
                                <label>Ghi chu</label>
                                <textarea className="form-control" rows="2"
                                    value={notes}
                                    onChange={this.onField('notes')}
                                    disabled={readonly} />
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggle}>Dong</button>
                    {!readonly && (
                        <button className="btn btn-primary" disabled={saving || loading}
                            onClick={this.onSave}>
                            {saving ? 'Dang luu...' : (exists ? 'Cap nhat' : 'Luu ho so')}
                        </button>
                    )}
                </ModalFooter>
            </Modal>
        );
    }
}

export default EmrModal;
