import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    doctorCreateAppointmentService,
    getAllCodeService
} from '../../../services/userService';
import { toast } from 'react-toastify';
import './CreateAppointmentModal.scss';

const emptyForm = {
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: '',
    address: '',
    birthday: '',
    doctorId: '',
    date: moment().format('DD/MM/YYYY'),
    timeType: '',
    reason: ''
};

class CreateAppointmentModal extends Component {
    state = {
        form: { ...emptyForm },
        timeOptions: [],
        submitting: false
    };

    async componentDidMount() {
        await this.loadTimes();
        this.setInitialDoctor();
    }

    async componentDidUpdate(prev) {
        if (!prev.isOpen && this.props.isOpen) {
            this.setState({ form: { ...emptyForm } }, this.setInitialDoctor);
        }
    }

    setInitialDoctor = () => {
        const { userInfo, lockedDoctorId } = this.props;
        if (lockedDoctorId) {
            this.setState(s => ({ form: { ...s.form, doctorId: lockedDoctorId } }));
        } else if (userInfo?.roleId === 'R2') {
            this.setState(s => ({ form: { ...s.form, doctorId: userInfo.id } }));
        }
    }

    loadTimes = async () => {
        try {
            const res = await getAllCodeService('TIME');
            if (res && res.errCode === 0) {
                this.setState({ timeOptions: res.data || [] });
            }
        } catch (e) { /* ignore */ }
    };

    onChange = (field, value) => {
        this.setState(s => ({ form: { ...s.form, [field]: value } }));
    };

    isValid() {
        const f = this.state.form;
        return f.email && f.fullName && f.doctorId && f.date && f.timeType;
    }

    handleSubmit = async () => {
        if (!this.isValid()) {
            toast.warn('Vui long nhap day du email, ho ten, bac si, ngay, gio');
            return;
        }
        this.setState({ submitting: true });
        try {
            const res = await doctorCreateAppointmentService({
                ...this.state.form,
                language: this.props.language
            });
            if (res && res.errCode === 0) {
                toast.success('Tao lich thanh cong va da gui email thong bao');
                this.props.onCreated && this.props.onCreated({
                    date: this.state.form.date,
                    bookingId: res.bookingId
                });
                this.props.toggle();
            } else {
                toast.error(res?.errMessage || 'Tao lich that bai');
            }
        } catch (e) {
            toast.error('Loi ket noi');
        } finally {
            this.setState({ submitting: false });
        }
    };

    render() {
        const { isOpen, toggle, doctorOptions, lockedDoctorId } = this.props;
        const { form, timeOptions, submitting } = this.state;
        const doctorLocked = !!lockedDoctorId || this.props.userInfo?.roleId === 'R2';

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
                <ModalHeader toggle={toggle}>Tao lich hen moi</ModalHeader>
                <ModalBody>
                    <div className="create-appt-form">
                        <div className="row">
                            <div className="col-md-6 form-group">
                                <label>Email benh nhan *</label>
                                <input type="email" className="form-control"
                                    value={form.email}
                                    onChange={e => this.onChange('email', e.target.value)} />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Ho ten benh nhan *</label>
                                <input type="text" className="form-control"
                                    value={form.fullName}
                                    onChange={e => this.onChange('fullName', e.target.value)} />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>So dien thoai</label>
                                <input type="tel" className="form-control"
                                    value={form.phoneNumber}
                                    onChange={e => this.onChange('phoneNumber', e.target.value)} />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Gioi tinh</label>
                                <select className="form-control"
                                    value={form.gender}
                                    onChange={e => this.onChange('gender', e.target.value)}>
                                    <option value="">-- Chon --</option>
                                    <option value="M">Nam</option>
                                    <option value="F">Nu</option>
                                    <option value="O">Khac</option>
                                </select>
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Ngay sinh</label>
                                <input type="date" className="form-control"
                                    value={form.birthday}
                                    onChange={e => this.onChange('birthday', e.target.value)} />
                            </div>
                            <div className="col-md-6 form-group">
                                <label>Dia chi</label>
                                <input type="text" className="form-control"
                                    value={form.address}
                                    onChange={e => this.onChange('address', e.target.value)} />
                            </div>

                            <div className="col-md-6 form-group">
                                <label>Bac si *</label>
                                {doctorLocked ? (
                                    <input type="text" className="form-control" disabled
                                        value={(doctorOptions || []).find(d => d.value == form.doctorId)?.label || '(ban)'} />
                                ) : (
                                    <select className="form-control"
                                        value={form.doctorId}
                                        onChange={e => this.onChange('doctorId', e.target.value)}>
                                        <option value="">-- Chon bac si --</option>
                                        {(doctorOptions || []).map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="col-md-3 form-group">
                                <label>Ngay kham (DD/MM/YYYY) *</label>
                                <input type="text" className="form-control"
                                    placeholder="19/04/2026"
                                    value={form.date}
                                    onChange={e => this.onChange('date', e.target.value)} />
                            </div>
                            <div className="col-md-3 form-group">
                                <label>Khung gio *</label>
                                <select className="form-control"
                                    value={form.timeType}
                                    onChange={e => this.onChange('timeType', e.target.value)}>
                                    <option value="">-- Chon gio --</option>
                                    {timeOptions.map(t => (
                                        <option key={t.keyMap} value={t.keyMap}>{t.valueVi}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 form-group">
                                <label>Ly do kham</label>
                                <textarea className="form-control" rows={2}
                                    value={form.reason}
                                    onChange={e => this.onChange('reason', e.target.value)} />
                            </div>
                        </div>

                        <div className="info-note">
                            <i className="fas fa-info-circle"></i>
                            Lich se duoc tao voi trang thai <b>Da xac nhan (S2)</b> va email thong bao tu dong gui toi benh nhan.
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggle}>Dong</button>
                    <button className="btn btn-primary" onClick={this.handleSubmit} disabled={submitting}>
                        {submitting ? 'Dang tao...' : 'Tao lich & gui email'}
                    </button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => ({
    userInfo: state.user.userInfo,
    language: state.app.language
});
export default connect(mapStateToProps)(CreateAppointmentModal);
