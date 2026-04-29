import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ManageAppointment.scss';
import DatePicker from '../../../components/Input/DatePicker';
import Select from 'react-select';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getAllAppointments, updateAppointmentStatus, markNoShowService } from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import CreateAppointmentModal from './CreateAppointmentModal';
import FollowUpModal from './FollowUpModal';

class ManageAppointment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            selectedDoctor: '',
            selectedStatus: '',
            selectedPaymentStatus: '',
            useDateRange: false,
            startDate: moment().startOf('week').valueOf(),
            endDate: moment().endOf('week').valueOf(),
            keyword: '',
            listDoctors: [],
            dataAppointments: [],
            isShowLoading: false,
            currentPage: 1,
            itemsPerPage: 15,
            showCreateModal: false,
            showFollowUpModal: false,
            followUpTarget: null
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        await this.loadAppointments();
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

    loadAppointments = async () => {
        this.setState({ isShowLoading: true });
        let { currentDate, selectedDoctor, selectedStatus, keyword,
            selectedPaymentStatus, useDateRange, startDate, endDate } = this.state;
        let formateDate = useDateRange ? '' : new Date(currentDate).getTime();
        try {
            let res = await getAllAppointments({
                date: formateDate,
                doctorId: selectedDoctor ? selectedDoctor.value || '' : '',
                statusId: selectedStatus ? selectedStatus.value || '' : '',
                q: keyword || '',
                paymentStatus: selectedPaymentStatus ? selectedPaymentStatus.value || '' : '',
                dateFrom: useDateRange && startDate ? startDate : '',
                dateTo: useDateRange && endDate ? endDate : ''
            });
            if (res && res.errCode === 0) {
                this.setState({
                    dataAppointments: res.data || [],
                    isShowLoading: false
                });
            } else {
                this.setState({ dataAppointments: [], isShowLoading: false });
            }
        } catch (e) {
            this.setState({ dataAppointments: [], isShowLoading: false });
            console.log('loadAppointments error:', e);
        }
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({ currentDate: date[0], currentPage: 1 }, async () => {
            await this.loadAppointments();
        });
    }

    handleChangeDoctor = (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption, currentPage: 1 }, async () => {
            await this.loadAppointments();
        });
    }

    handleChangeStatus = (selectedOption) => {
        this.setState({ selectedStatus: selectedOption, currentPage: 1 }, async () => {
            await this.loadAppointments();
        });
    }

    handleConfirmAppointment = async (item) => {
        if (window.confirm('Xác nhận lịch hẹn này?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await updateAppointmentStatus({
                    appointmentId: item.id,
                    statusId: 'S2' // Đã xác nhận
                });
                if (res && res.errCode === 0) {
                    toast.success('Xác nhận lịch hẹn thành công!');
                    await this.loadAppointments();
                } else {
                    toast.error('Xác nhận thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Xác nhận thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    handleCompleteAppointment = async (item) => {
        if (window.confirm('Đánh dấu lịch hẹn này đã hoàn thành?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await updateAppointmentStatus({
                    appointmentId: item.id,
                    statusId: 'S3' // Đã khám xong
                });
                if (res && res.errCode === 0) {
                    toast.success('Cập nhật thành công!');
                    await this.loadAppointments();
                } else {
                    toast.error('Cập nhật thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Cập nhật thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    handleCancelAppointment = async (item) => {
        let reason = window.prompt('Nhap ly do huy lich hen (bat buoc):', '');
        if (reason === null) return;
        reason = (reason || '').trim();
        if (!reason) {
            toast.warn('Vui long nhap ly do huy');
            return;
        }
        this.setState({ isShowLoading: true });
        try {
            let res = await updateAppointmentStatus({
                appointmentId: item.id,
                statusId: 'S4',
                cancellationReason: reason
            });
            if (res && res.errCode === 0) {
                let paidMsg = item.paymentStatus === 'paid'
                    ? ' Giao dich VNPay da duoc danh dau hoan tien.'
                    : '';
                toast.success('Huy lich hen thanh cong!' + paidMsg);
                await this.loadAppointments();
            } else {
                toast.error('Huy lich hen that bai!');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Huy lich hen that bai!');
            this.setState({ isShowLoading: false });
        }
    }

    handleOpenFollowUp = (item) => {
        this.setState({ showFollowUpModal: true, followUpTarget: item });
    }

    handleMarkNoShow = async (item) => {
        const reason = window.prompt('Ly do khong den (tuy chon):', 'Benh nhan khong den');
        if (reason === null) return;
        this.setState({ isShowLoading: true });
        try {
            const res = await markNoShowService({ bookingId: item.id, reason: reason.trim() || 'Benh nhan khong den' });
            if (res && res.errCode === 0) {
                toast.success('Da danh dau khong den');
                await this.loadAppointments();
            } else {
                toast.error(res?.errMessage || 'That bai');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Loi ket noi');
            this.setState({ isShowLoading: false });
        }
    }

    getStatusLabel = (statusId) => {
        switch (statusId) {
            case 'S1': return { text: 'Chờ xác nhận', className: 'status-pending' };
            case 'S2': return { text: 'Đã xác nhận', className: 'status-confirmed' };
            case 'S3': return { text: 'Đã khám', className: 'status-done' };
            case 'S4': return { text: 'Đã hủy', className: 'status-cancelled' };
            default: return { text: 'N/A', className: '' };
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    filterByKeyword = (items) => {
        const kw = (this.state.keyword || '').trim().toLowerCase();
        if (!kw) return items;
        return items.filter(i => {
            const name = (i.patientData?.firstName || '').toLowerCase();
            const email = (i.patientData?.email || '').toLowerCase();
            const phone = (i.phoneNumber || '').toLowerCase();
            const reason = (i.reason || '').toLowerCase();
            return name.includes(kw) || email.includes(kw) || phone.includes(kw) || reason.includes(kw);
        });
    }

    render() {
        let { language } = this.props;
        let { dataAppointments, listDoctors, isShowLoading, currentPage, itemsPerPage, showCreateModal, showFollowUpModal, followUpTarget, keyword } = this.state;

        const filteredAppointments = this.filterByKeyword(dataAppointments);

        let statusOptions = [
            { label: '-- Tất cả trạng thái --', value: '' },
            { label: 'Chờ xác nhận', value: 'S1' },
            { label: 'Đã xác nhận', value: 'S2' },
            { label: 'Đã khám', value: 'S3' },
            { label: 'Đã hủy', value: 'S4' },
        ];

        // Pagination (apply keyword filter first)
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = filteredAppointments.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

        // Stats (on filtered view)
        let totalCount = filteredAppointments.length;
        let pendingCount = filteredAppointments.filter(i => i.statusId === 'S1').length;
        let confirmedCount = filteredAppointments.filter(i => i.statusId === 'S2').length;
        let doneCount = filteredAppointments.filter(i => i.statusId === 'S3').length;
        let cancelledCount = filteredAppointments.filter(i => i.statusId === 'S4').length;

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="manage-appointment-container">
                    <div className="ma-header">
                        <div className="ma-title">Quản lý lịch hẹn khám bệnh</div>
                        <button className="btn btn-success btn-create"
                            onClick={() => this.setState({ showCreateModal: true })}>
                            <i className="fas fa-plus"></i> Tao lich moi
                        </button>
                    </div>

                    <div className="ma-filter row">
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
                        <div className="col-3 form-group">
                            <label>Trạng thái</label>
                            <Select
                                value={this.state.selectedStatus}
                                onChange={this.handleChangeStatus}
                                options={statusOptions}
                                placeholder="-- Tất cả trạng thái --"
                            />
                        </div>
                        <div className="col-3 form-group">
                            <label>Trang thai thanh toan</label>
                            <Select
                                value={this.state.selectedPaymentStatus}
                                onChange={(opt) => this.setState({ selectedPaymentStatus: opt, currentPage: 1 }, this.loadAppointments)}
                                options={[
                                    { label: '-- Tat ca --', value: '' },
                                    { label: 'Da thanh toan', value: 'paid' },
                                    { label: 'Cho thanh toan', value: 'pending' },
                                    { label: 'Hoan tien', value: 'refunded' },
                                    { label: 'That bai', value: 'failed' }
                                ]}
                                placeholder="-- Tat ca --"
                            />
                        </div>
                        <div className="col-3 form-group">
                            <label>Tu khoa (ten / email / ma)</label>
                            <input type="text" className="form-control"
                                placeholder="Nhap va Enter..."
                                value={keyword}
                                onChange={(e) => this.setState({ keyword: e.target.value, currentPage: 1 })}
                                onKeyDown={(e) => { if (e.key === 'Enter') this.loadAppointments(); }} />
                        </div>
                        <div className="col-3 form-group">
                            <label>
                                <input type="checkbox"
                                    checked={this.state.useDateRange}
                                    onChange={(e) => this.setState({ useDateRange: e.target.checked }, this.loadAppointments)}
                                /> Dung khoang ngay
                            </label>
                            {this.state.useDateRange && (
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <DatePicker
                                        onChange={(d) => this.setState({ startDate: d[0] }, this.loadAppointments)}
                                        className="form-control"
                                        value={this.state.startDate}
                                    />
                                    <DatePicker
                                        onChange={(d) => this.setState({ endDate: d[0] }, this.loadAppointments)}
                                        className="form-control"
                                        value={this.state.endDate}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="col-3 form-group d-flex align-items-end">
                            <button className="btn btn-primary" onClick={this.loadAppointments}>
                                <i className="fas fa-search"></i> Tim kiem
                            </button>
                        </div>
                    </div>

                    <div className="ma-stats">
                        <div className="stat-item stat-total">
                            <span className="stat-number">{totalCount}</span>
                            <span className="stat-label">Tổng</span>
                        </div>
                        <div className="stat-item stat-pending">
                            <span className="stat-number">{pendingCount}</span>
                            <span className="stat-label">Chờ xác nhận</span>
                        </div>
                        <div className="stat-item stat-confirmed">
                            <span className="stat-number">{confirmedCount}</span>
                            <span className="stat-label">Đã xác nhận</span>
                        </div>
                        <div className="stat-item stat-done">
                            <span className="stat-number">{doneCount}</span>
                            <span className="stat-label">Đã khám</span>
                        </div>
                        <div className="stat-item stat-cancelled">
                            <span className="stat-number">{cancelledCount}</span>
                            <span className="stat-label">Đã hủy</span>
                        </div>
                    </div>

                    <div className="ma-table">
                        <table id="TableManageAppointment">
                            <tbody>
                                <tr>
                                    <th>STT</th>
                                    <th>Thời gian</th>
                                    <th>Bệnh nhân</th>
                                    <th>Giới tính</th>
                                    <th>Địa chỉ</th>
                                    <th>Bác sĩ</th>
                                    <th>Lý do khám</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                                {currentItems && currentItems.length > 0 ? (
                                    currentItems.map((item, index) => {
                                        let time = language === LANGUAGES.VI
                                            ? (item.timeTypeDataPatient ? item.timeTypeDataPatient.valueVi : '')
                                            : (item.timeTypeDataPatient ? item.timeTypeDataPatient.valueEn : '');
                                        let gender = language === LANGUAGES.VI
                                            ? (item.patientData && item.patientData.genderData ? item.patientData.genderData.valueVi : '')
                                            : (item.patientData && item.patientData.genderData ? item.patientData.genderData.valueEn : '');
                                        let doctorName = item.doctorData
                                            ? (language === LANGUAGES.VI
                                                ? `${item.doctorData.lastName} ${item.doctorData.firstName}`
                                                : `${item.doctorData.firstName} ${item.doctorData.lastName}`)
                                            : '';
                                        let statusInfo = this.getStatusLabel(item.statusId);

                                        return (
                                            <tr key={index}>
                                                <td>{indexOfFirst + index + 1}</td>
                                                <td>{time}</td>
                                                <td>{item.patientData ? item.patientData.firstName : ''}</td>
                                                <td>{gender}</td>
                                                <td>{item.patientData ? item.patientData.address : ''}</td>
                                                <td>{doctorName}</td>
                                                <td>{item.reason || ''}</td>
                                                <td>
                                                    <span className={`status-badge ${statusInfo.className}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="action-buttons">
                                                    {item.statusId === 'S1' && (
                                                        <>
                                                            <button className="btn-confirm"
                                                                title="Xác nhận"
                                                                onClick={() => this.handleConfirmAppointment(item)}>
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                            <button className="btn-cancel"
                                                                title="Hủy"
                                                                onClick={() => this.handleCancelAppointment(item)}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.statusId === 'S2' && (
                                                        <>
                                                            <button className="btn-complete"
                                                                title="Hoàn thành"
                                                                onClick={() => this.handleCompleteAppointment(item)}>
                                                                <i className="fas fa-check-double"></i>
                                                            </button>
                                                            <button className="btn-noshow"
                                                                title="Khong den"
                                                                onClick={() => this.handleMarkNoShow(item)}
                                                                style={{ background: '#d23e3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', marginRight: 4 }}>
                                                                <i className="fas fa-user-slash"></i>
                                                            </button>
                                                            <button className="btn-cancel"
                                                                title="Hủy"
                                                                onClick={() => this.handleCancelAppointment(item)}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    {item.statusId === 'S3' && (
                                                        <button className="btn-followup"
                                                            title="Hen tai kham"
                                                            onClick={() => this.handleOpenFollowUp(item)}>
                                                            <i className="fas fa-calendar-plus"></i>
                                                        </button>
                                                    )}
                                                    {item.statusId === 'S4' && (
                                                        <span className="no-action">--</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center' }}>
                                            Không có lịch hẹn nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="appointment-pagination">
                            <button disabled={currentPage === 1}
                                onClick={() => this.handlePageChange(currentPage - 1)}>
                                &laquo;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => this.handlePageChange(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={currentPage === totalPages}
                                onClick={() => this.handlePageChange(currentPage + 1)}>
                                &raquo;
                            </button>
                        </div>
                    )}

                    <CreateAppointmentModal
                        isOpen={showCreateModal}
                        toggle={() => this.setState({ showCreateModal: !this.state.showCreateModal })}
                        doctorOptions={listDoctors.filter(o => o.value)}
                        onCreated={this.loadAppointments}
                    />

                    <FollowUpModal
                        isOpen={showFollowUpModal}
                        toggle={() => this.setState({ showFollowUpModal: !this.state.showFollowUpModal })}
                        appointment={followUpTarget}
                    />
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        allDoctors: state.admin.allDoctors,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageAppointment);
