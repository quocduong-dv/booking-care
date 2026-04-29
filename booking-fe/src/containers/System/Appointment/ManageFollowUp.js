import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ManageFollowUp.scss';
import DatePicker from '../../../components/Input/DatePicker';
import Select from 'react-select';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getAllFollowUpAppointments, sendFollowUpReminder } from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

class ManageFollowUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            selectedDoctor: '',
            listDoctors: [],
            dataFollowUps: [],
            isShowLoading: false,
            currentPage: 1,
            itemsPerPage: 15
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        await this.loadFollowUps();
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

    loadFollowUps = async () => {
        this.setState({ isShowLoading: true });
        let { currentDate, selectedDoctor } = this.state;
        let formateDate = new Date(currentDate).getTime();
        try {
            let res = await getAllFollowUpAppointments({
                date: formateDate,
                doctorId: selectedDoctor ? selectedDoctor.value || '' : ''
            });
            if (res && res.errCode === 0) {
                this.setState({
                    dataFollowUps: res.data || [],
                    isShowLoading: false
                });
            } else {
                this.setState({ dataFollowUps: [], isShowLoading: false });
            }
        } catch (e) {
            this.setState({ dataFollowUps: [], isShowLoading: false });
            console.log('loadFollowUps error:', e);
        }
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({ currentDate: date[0], currentPage: 1 }, async () => {
            await this.loadFollowUps();
        });
    }

    handleChangeDoctor = (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption, currentPage: 1 }, async () => {
            await this.loadFollowUps();
        });
    }

    handleSendReminder = async (item) => {
        if (window.confirm(`Gửi nhắc nhở tái khám cho bệnh nhân "${item.patientData ? item.patientData.firstName : ''}"?`)) {
            this.setState({ isShowLoading: true });
            try {
                let res = await sendFollowUpReminder({
                    appointmentId: item.id,
                    patientId: item.patientId,
                    doctorId: item.doctorId,
                    email: item.patientData ? item.patientData.email : '',
                    patientName: item.patientData ? item.patientData.firstName : '',
                    followUpDate: item.followUpDate,
                    language: this.props.language
                });
                if (res && res.errCode === 0) {
                    toast.success('Gửi nhắc nhở tái khám thành công!');
                    this.setState({ isShowLoading: false });
                } else {
                    toast.error('Gửi nhắc nhở thất bại!');
                    this.setState({ isShowLoading: false });
                }
            } catch (e) {
                toast.error('Gửi nhắc nhở thất bại!');
                this.setState({ isShowLoading: false });
            }
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    render() {
        let { language } = this.props;
        let { dataFollowUps, listDoctors, isShowLoading, currentPage, itemsPerPage } = this.state;

        // Pagination
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = dataFollowUps.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(dataFollowUps.length / itemsPerPage);

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="manage-followup-container">
                    <div className="mf-title">Quản lý lịch tái khám</div>

                    <div className="mf-filter row">
                        <div className="col-3 form-group">
                            <label>Ngày tái khám</label>
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
                            <button className="btn btn-primary" onClick={this.loadFollowUps}>
                                <i className="fas fa-search"></i> Tìm kiếm
                            </button>
                        </div>
                    </div>

                    <div className="mf-summary">
                        <span className="summary-count">
                            <i className="fas fa-calendar-check"></i>
                            Tổng số lịch tái khám: <strong>{dataFollowUps.length}</strong>
                        </span>
                    </div>

                    <div className="mf-table">
                        <table id="TableManageFollowUp">
                            <tbody>
                                <tr>
                                    <th>STT</th>
                                    <th>Bệnh nhân</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Bác sĩ</th>
                                    <th>Ngày khám trước</th>
                                    <th>Ngày tái khám</th>
                                    <th>Ghi chú</th>
                                    <th>Hành động</th>
                                </tr>
                                {currentItems && currentItems.length > 0 ? (
                                    currentItems.map((item, index) => {
                                        let doctorName = item.doctorData
                                            ? (language === LANGUAGES.VI
                                                ? `${item.doctorData.lastName} ${item.doctorData.firstName}`
                                                : `${item.doctorData.firstName} ${item.doctorData.lastName}`)
                                            : '';
                                        let prevDate = item.previousDate
                                            ? moment(+item.previousDate).format('DD/MM/YYYY')
                                            : '';
                                        let followDate = item.followUpDate
                                            ? moment(+item.followUpDate).format('DD/MM/YYYY')
                                            : '';

                                        return (
                                            <tr key={index}>
                                                <td>{indexOfFirst + index + 1}</td>
                                                <td>{item.patientData ? item.patientData.firstName : ''}</td>
                                                <td>{item.patientData ? item.patientData.email : ''}</td>
                                                <td>{item.patientData ? item.patientData.phonenumber : ''}</td>
                                                <td>{doctorName}</td>
                                                <td>{prevDate}</td>
                                                <td>{followDate}</td>
                                                <td>{item.note || ''}</td>
                                                <td>
                                                    <button className="btn-send-reminder"
                                                        title="Gửi nhắc nhở"
                                                        onClick={() => this.handleSendReminder(item)}>
                                                        <i className="fas fa-bell"></i> Nhắc nhở
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center' }}>
                                            Không có lịch tái khám nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="followup-pagination">
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageFollowUp);
