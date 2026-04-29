import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageLeave.scss';
import Select from 'react-select';
import DatePicker from '../../../components/Input/DatePicker';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import {
    getAllDoctorLeaves, createDoctorLeave,
    approveDoctorLeave, rejectDoctorLeave, deleteDoctorLeave
} from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ManageLeave extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listDoctors: [],
            selectedDoctor: '',
            selectedStatus: { label: '-- Tất cả --', value: '' },
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
            leaveList: [],
            isShowLoading: false,

            // Create form
            isShowCreateForm: false,
            leaveDoctor: '',
            leaveStartDate: '',
            leaveEndDate: '',
            leaveType: 'annual',
            leaveReason: '',

            currentPage: 1,
            itemsPerPage: 10
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        await this.loadLeaves();
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

    loadLeaves = async () => {
        this.setState({ isShowLoading: true });
        let { selectedDoctor, selectedStatus, selectedMonth, selectedYear } = this.state;
        try {
            let res = await getAllDoctorLeaves({
                doctorId: selectedDoctor ? selectedDoctor.value || '' : '',
                status: selectedStatus ? selectedStatus.value || '' : '',
                month: selectedMonth,
                year: selectedYear
            });
            if (res && res.errCode === 0) {
                this.setState({ leaveList: res.data || [], isShowLoading: false });
            } else {
                this.setState({ leaveList: [], isShowLoading: false });
            }
        } catch (e) {
            this.setState({ leaveList: [], isShowLoading: false });
        }
    }

    handleChangeDoctor = (opt) => {
        this.setState({ selectedDoctor: opt, currentPage: 1 }, () => this.loadLeaves());
    }

    handleChangeStatus = (opt) => {
        this.setState({ selectedStatus: opt, currentPage: 1 }, () => this.loadLeaves());
    }

    handleChangeMonth = (e) => {
        this.setState({ selectedMonth: e.target.value }, () => this.loadLeaves());
    }

    handleChangeYear = (e) => {
        this.setState({ selectedYear: e.target.value }, () => this.loadLeaves());
    }

    // ========== CREATE ==========
    toggleCreateForm = () => {
        this.setState(prev => ({
            isShowCreateForm: !prev.isShowCreateForm,
            leaveDoctor: '',
            leaveStartDate: '',
            leaveEndDate: '',
            leaveType: 'annual',
            leaveReason: ''
        }));
    }

    handleSaveLeave = async () => {
        let { leaveDoctor, leaveStartDate, leaveEndDate, leaveType, leaveReason } = this.state;
        if (!leaveDoctor || !leaveDoctor.value) { toast.error('Vui lòng chọn bác sĩ!'); return; }
        if (!leaveStartDate) { toast.error('Vui lòng chọn ngày bắt đầu!'); return; }
        if (!leaveEndDate) { toast.error('Vui lòng chọn ngày kết thúc!'); return; }

        this.setState({ isShowLoading: true });
        try {
            let res = await createDoctorLeave({
                doctorId: leaveDoctor.value,
                startDate: new Date(leaveStartDate).getTime(),
                endDate: new Date(leaveEndDate).getTime(),
                leaveType,
                reason: leaveReason
            });
            if (res && res.errCode === 0) {
                toast.success('Tạo đơn xin nghỉ thành công!');
                this.toggleCreateForm();
                await this.loadLeaves();
            } else {
                toast.error(res.errMessage || 'Tạo thất bại!');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Tạo thất bại!');
            this.setState({ isShowLoading: false });
        }
    }

    // ========== APPROVE / REJECT / DELETE ==========
    handleApprove = async (item) => {
        if (window.confirm('Duyệt đơn nghỉ này?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await approveDoctorLeave({ leaveId: item.id });
                if (res && res.errCode === 0) {
                    toast.success('Đã duyệt đơn nghỉ!');
                    await this.loadLeaves();
                } else {
                    toast.error('Duyệt thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Duyệt thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    handleReject = async (item) => {
        if (window.confirm('Từ chối đơn nghỉ này?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await rejectDoctorLeave({ leaveId: item.id });
                if (res && res.errCode === 0) {
                    toast.success('Đã từ chối đơn nghỉ!');
                    await this.loadLeaves();
                } else {
                    toast.error('Từ chối thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Từ chối thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    handleDelete = async (item) => {
        if (window.confirm('Xóa đơn nghỉ này?')) {
            this.setState({ isShowLoading: true });
            try {
                let res = await deleteDoctorLeave(item.id);
                if (res && res.errCode === 0) {
                    toast.success('Xóa thành công!');
                    await this.loadLeaves();
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

    getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return { text: 'Chờ duyệt', className: 'leave-pending' };
            case 'approved': return { text: 'Đã duyệt', className: 'leave-approved' };
            case 'rejected': return { text: 'Từ chối', className: 'leave-rejected' };
            default: return { text: 'N/A', className: '' };
        }
    }

    getLeaveTypeLabel = (type) => {
        switch (type) {
            case 'annual': return 'Nghỉ phép';
            case 'sick': return 'Nghỉ bệnh';
            case 'personal': return 'Việc riêng';
            default: return type;
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    render() {
        let {
            listDoctors, leaveList, isShowLoading, isShowCreateForm,
            currentPage, itemsPerPage
        } = this.state;

        let statusOptions = [
            { label: '-- Tất cả --', value: '' },
            { label: 'Chờ duyệt', value: 'pending' },
            { label: 'Đã duyệt', value: 'approved' },
            { label: 'Từ chối', value: 'rejected' },
        ];

        let currentYear = new Date().getFullYear();
        let months = Array.from({ length: 12 }, (_, i) => i + 1);
        let years = Array.from({ length: 5 }, (_, i) => currentYear - i);

        // Stats
        let pendingCount = leaveList.filter(i => i.status === 'pending').length;
        let approvedCount = leaveList.filter(i => i.status === 'approved').length;

        // Pagination
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = leaveList.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(leaveList.length / itemsPerPage);

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="manage-leave-container">
                    <div className="ml-title">Quản lý nghỉ phép bác sĩ</div>

                    {/* Filter */}
                    <div className="ml-filter row">
                        <div className="col-2 form-group">
                            <label>Bác sĩ</label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeDoctor}
                                options={listDoctors}
                                placeholder="Tất cả"
                            />
                        </div>
                        <div className="col-2 form-group">
                            <label>Trạng thái</label>
                            <Select
                                value={this.state.selectedStatus}
                                onChange={this.handleChangeStatus}
                                options={statusOptions}
                            />
                        </div>
                        <div className="col-1 form-group">
                            <label>Tháng</label>
                            <select className="form-control" value={this.state.selectedMonth}
                                onChange={this.handleChangeMonth}>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="col-1 form-group">
                            <label>Năm</label>
                            <select className="form-control" value={this.state.selectedYear}
                                onChange={this.handleChangeYear}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="col-3 form-group d-flex align-items-end">
                            <button className="btn btn-success" onClick={this.toggleCreateForm}>
                                <i className="fas fa-plus"></i> Tạo đơn nghỉ
                            </button>
                        </div>
                        <div className="col-3 d-flex align-items-end">
                            <div className="leave-stat">
                                <span className="stat-badge pending-badge">{pendingCount} chờ duyệt</span>
                                <span className="stat-badge approved-badge">{approvedCount} đã duyệt</span>
                            </div>
                        </div>
                    </div>

                    {/* Create Form */}
                    {isShowCreateForm && (
                        <div className="ml-create-form">
                            <div className="form-title">Tạo đơn xin nghỉ</div>
                            <div className="row">
                                <div className="col-3 form-group">
                                    <label>Bác sĩ *</label>
                                    <Select
                                        value={this.state.leaveDoctor}
                                        onChange={(opt) => this.setState({ leaveDoctor: opt })}
                                        options={listDoctors.filter(d => d.value)}
                                        placeholder="Chọn bác sĩ"
                                    />
                                </div>
                                <div className="col-2 form-group">
                                    <label>Từ ngày *</label>
                                    <DatePicker
                                        onChange={(date) => this.setState({ leaveStartDate: date[0] })}
                                        className="form-control"
                                        value={this.state.leaveStartDate}
                                    />
                                </div>
                                <div className="col-2 form-group">
                                    <label>Đến ngày *</label>
                                    <DatePicker
                                        onChange={(date) => this.setState({ leaveEndDate: date[0] })}
                                        className="form-control"
                                        value={this.state.leaveEndDate}
                                    />
                                </div>
                                <div className="col-2 form-group">
                                    <label>Loại nghỉ</label>
                                    <select className="form-control" value={this.state.leaveType}
                                        onChange={(e) => this.setState({ leaveType: e.target.value })}>
                                        <option value="annual">Nghỉ phép</option>
                                        <option value="sick">Nghỉ bệnh</option>
                                        <option value="personal">Việc riêng</option>
                                    </select>
                                </div>
                                <div className="col-3 form-group">
                                    <label>Lý do</label>
                                    <input className="form-control" value={this.state.leaveReason}
                                        onChange={(e) => this.setState({ leaveReason: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={this.handleSaveLeave}>
                                    <i className="fas fa-save"></i> Lưu
                                </button>
                                <button className="btn btn-secondary" onClick={this.toggleCreateForm}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="ml-table">
                        <table id="TableLeave">
                            <tbody>
                                <tr>
                                    <th>STT</th>
                                    <th>Bác sĩ</th>
                                    <th>Từ ngày</th>
                                    <th>Đến ngày</th>
                                    <th>Số ngày</th>
                                    <th>Loại</th>
                                    <th>Lý do</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                                {currentItems && currentItems.length > 0 ? (
                                    currentItems.map((item, index) => {
                                        let statusInfo = this.getStatusLabel(item.status);
                                        let start = item.startDate ? moment(+item.startDate) : null;
                                        let end = item.endDate ? moment(+item.endDate) : null;
                                        let days = start && end ? end.diff(start, 'days') + 1 : '';

                                        return (
                                            <tr key={index}>
                                                <td>{indexOfFirst + index + 1}</td>
                                                <td>{item.doctorName || ''}</td>
                                                <td>{start ? start.format('DD/MM/YYYY') : ''}</td>
                                                <td>{end ? end.format('DD/MM/YYYY') : ''}</td>
                                                <td>{days}</td>
                                                <td>{this.getLeaveTypeLabel(item.leaveType)}</td>
                                                <td>{item.reason || ''}</td>
                                                <td>
                                                    <span className={`leave-badge ${statusInfo.className}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="action-col">
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <button className="btn-action btn-approve" title="Duyệt"
                                                                onClick={() => this.handleApprove(item)}>
                                                                <i className="fas fa-check"></i>
                                                            </button>
                                                            <button className="btn-action btn-reject" title="Từ chối"
                                                                onClick={() => this.handleReject(item)}>
                                                                <i className="fas fa-ban"></i>
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="btn-action btn-del" title="Xóa"
                                                        onClick={() => this.handleDelete(item)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="leave-pagination">
                            <button disabled={currentPage === 1}
                                onClick={() => this.handlePageChange(currentPage - 1)}>&laquo;</button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => this.handlePageChange(i + 1)}>{i + 1}</button>
                            ))}
                            <button disabled={currentPage === totalPages}
                                onClick={() => this.handlePageChange(currentPage + 1)}>&raquo;</button>
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
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageLeave);
