import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { getPatientBookingDetailService } from '../../../services/userService';
import './BookingDetailModal.scss';

class BookingDetailModal extends Component {
    state = { data: null, loading: true };

    async componentDidMount() {
        await this.load();
    }

    async componentDidUpdate(prev) {
        if (prev.bookingId !== this.props.bookingId && this.props.bookingId) {
            await this.load();
        }
    }

    load = async () => {
        const { bookingId, patientId } = this.props;
        if (!bookingId || !patientId) return;
        this.setState({ loading: true });
        try {
            const res = await getPatientBookingDetailService(bookingId, patientId);
            if (res && res.errCode === 0) {
                this.setState({ data: res.data, loading: false });
            } else {
                this.setState({ data: null, loading: false });
            }
        } catch (e) {
            this.setState({ data: null, loading: false });
        }
    };

    renderRow(label, value) {
        return (
            <div className="row-detail">
                <div className="label">{label}</div>
                <div className="value">{value || '—'}</div>
            </div>
        );
    }

    render() {
        const { isOpen, toggle } = this.props;
        const { data, loading } = this.state;

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
                <ModalHeader toggle={toggle}>Chi tiet lich kham</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <div className="text-center p-4">Dang tai...</div>
                    ) : !data ? (
                        <div className="text-center p-4 text-muted">Khong tim thay du lieu</div>
                    ) : (
                        <div className="booking-detail">
                            <h5>Thong tin lich hen</h5>
                            {this.renderRow('Ma lich', `#${data.id}`)}
                            {this.renderRow('Bac si',
                                data.doctorData
                                    ? `${data.doctorData.lastName || ''} ${data.doctorData.firstName || ''}`.trim()
                                    : '—')}
                            {this.renderRow('Ngay', data.date)}
                            {this.renderRow('Gio', data.timeTypeDataPatient?.valueVi || data.timeType)}
                            {this.renderRow('Ly do kham', data.reason)}
                            {this.renderRow('SDT', data.phoneNumber)}
                            {this.renderRow('Ly do huy', data.cancellationReason)}

                            <h5 className="mt-3">Thanh toan</h5>
                            {this.renderRow('Phuong thuc',
                                data.paymentMethod === 'vnpay' ? 'VNPay' : 'Tien mat')}
                            {this.renderRow('So tien',
                                data.amount ? `${Number(data.amount).toLocaleString('vi-VN')} VND` : '—')}
                            {this.renderRow('Trang thai', data.paymentStatus || '—')}
                            {data.paymentData && this.renderRow('Ma GD',
                                data.paymentData.transactionId || data.paymentData.txnRef)}
                            {data.paymentData?.paidAt && this.renderRow('Thoi diem thanh toan',
                                new Date(data.paymentData.paidAt).toLocaleString('vi-VN'))}

                            {data.reviewData?.id && (
                                <>
                                    <h5 className="mt-3">Danh gia da gui</h5>
                                    {this.renderRow('So sao', `${data.reviewData.rating} / 5`)}
                                    {this.renderRow('Binh luan', data.reviewData.comment)}
                                </>
                            )}

                            {data.prescriptionData && (
                                <>
                                    <h5 className="mt-3">Don thuoc</h5>
                                    {this.renderRow('Chan doan', data.prescriptionData.diagnosis)}
                                    {this.renderRow('Ghi chu', data.prescriptionData.note)}
                                </>
                            )}
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

export default BookingDetailModal;
