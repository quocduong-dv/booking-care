import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import moment from 'moment';
import { createFollowUpAppointment } from '../../../services/userService';
import { toast } from 'react-toastify';
import './FollowUpModal.scss';

const defaultForm = () => ({
    followUpDate: moment().add(7, 'days').format('DD/MM/YYYY'),
    note: ''
});

const parseDateToMs = (raw) => {
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        d.setHours(0, 0, 0, 0);
        return String(d.getTime());
    }
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
        const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        d.setHours(0, 0, 0, 0);
        return String(d.getTime());
    }
    return null;
};

class FollowUpModal extends Component {
    state = {
        form: defaultForm(),
        submitting: false
    };

    componentDidUpdate(prev) {
        if (!prev.isOpen && this.props.isOpen) {
            this.setState({ form: defaultForm(), submitting: false });
        }
    }

    onChange = (field, value) => {
        this.setState(s => ({ form: { ...s.form, [field]: value } }));
    };

    handleSubmit = async () => {
        const { appointment } = this.props;
        const { form } = this.state;
        if (!appointment) return;

        const followUpMs = parseDateToMs(form.followUpDate);
        if (!followUpMs) {
            toast.warn('Ngay tai kham khong hop le (DD/MM/YYYY)');
            return;
        }
        if (Number(followUpMs) <= Date.now()) {
            toast.warn('Ngay tai kham phai sau hom nay');
            return;
        }

        this.setState({ submitting: true });
        try {
            const res = await createFollowUpAppointment({
                patientId: appointment.patientId,
                doctorId: appointment.doctorId,
                previousDate: appointment.date,
                followUpDate: followUpMs,
                note: form.note
            });
            if (res && res.errCode === 0) {
                toast.success('Tao lich tai kham thanh cong');
                this.props.onCreated && this.props.onCreated();
                this.props.toggle();
            } else {
                toast.error(res?.errMessage || 'Tao lich tai kham that bai');
            }
        } catch (e) {
            toast.error('Loi ket noi');
        } finally {
            this.setState({ submitting: false });
        }
    };

    render() {
        const { isOpen, toggle, appointment } = this.props;
        const { form, submitting } = this.state;

        const patientName = appointment?.patientData?.firstName || '';
        const doctorName = appointment?.doctorData
            ? `${appointment.doctorData.lastName || ''} ${appointment.doctorData.firstName || ''}`.trim()
            : '';
        const prevDate = appointment?.date
            ? moment(+appointment.date).format('DD/MM/YYYY')
            : '';

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered size="md">
                <ModalHeader toggle={toggle}>Hen tai kham</ModalHeader>
                <ModalBody>
                    <div className="follow-up-form">
                        <div className="readonly-row">
                            <div><b>Benh nhan:</b> {patientName}</div>
                            <div><b>Bac si:</b> {doctorName}</div>
                            <div><b>Ngay kham truoc:</b> {prevDate}</div>
                        </div>

                        <div className="form-group">
                            <label>Ngay tai kham (DD/MM/YYYY) *</label>
                            <input type="text" className="form-control"
                                placeholder="27/04/2026"
                                value={form.followUpDate}
                                onChange={e => this.onChange('followUpDate', e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label>Ghi chu</label>
                            <textarea className="form-control" rows={3}
                                placeholder="Dan benh nhan quay lai tai kham sau 1 tuan..."
                                value={form.note}
                                onChange={e => this.onChange('note', e.target.value)} />
                        </div>

                        <div className="info-note">
                            <i className="fas fa-info-circle"></i>
                            Lich tai kham se duoc luu. Ban co the gui nhac nho qua email o muc "Quan ly lich tai kham".
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggle}>Dong</button>
                    <button className="btn btn-primary" onClick={this.handleSubmit} disabled={submitting}>
                        {submitting ? 'Dang luu...' : 'Luu lich tai kham'}
                    </button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default FollowUpModal;
