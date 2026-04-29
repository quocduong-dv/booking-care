import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageWorkSchedule.scss';
import Select from 'react-select';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getDoctorWorkSchedule, saveDoctorWorkSchedule } from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

const SHIFTS = [
    { key: 'morning', label: 'Sáng (7:00 - 11:30)', time: '07:00 - 11:30' },
    { key: 'afternoon', label: 'Chiều (13:30 - 17:00)', time: '13:30 - 17:00' },
    { key: 'evening', label: 'Tối (18:00 - 20:00)', time: '18:00 - 20:00' },
];

const WEEKDAYS = [
    { key: 'mon', label: 'Thứ 2' },
    { key: 'tue', label: 'Thứ 3' },
    { key: 'wed', label: 'Thứ 4' },
    { key: 'thu', label: 'Thứ 5' },
    { key: 'fri', label: 'Thứ 6' },
    { key: 'sat', label: 'Thứ 7' },
    { key: 'sun', label: 'CN' },
];

class ManageWorkSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listDoctors: [],
            selectedDoctor: '',
            currentWeekStart: moment().startOf('isoWeek').valueOf(),
            scheduleData: {},
            leaveData: [],
            isShowLoading: false,
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDoctorSelect(this.props.allDoctors);
            this.setState({ listDoctors: dataSelect });
        }
    }

    buildDoctorSelect = (inputData) => {
        let result = [];
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

    loadWorkSchedule = async () => {
        let { selectedDoctor, currentWeekStart } = this.state;
        if (!selectedDoctor || !selectedDoctor.value) {
            toast.warning('Vui lòng chọn bác sĩ!');
            return;
        }
        this.setState({ isShowLoading: true });
        try {
            let res = await getDoctorWorkSchedule({
                doctorId: selectedDoctor.value,
                weekStart: new Date(currentWeekStart).getTime()
            });
            if (res && res.errCode === 0) {
                this.setState({
                    scheduleData: res.data?.schedule || {},
                    leaveData: res.data?.leaves || [],
                    isShowLoading: false
                });
            } else {
                this.setState({ scheduleData: {}, leaveData: [], isShowLoading: false });
            }
        } catch (e) {
            this.setState({ scheduleData: {}, leaveData: [], isShowLoading: false });
        }
    }

    handleChangeDoctor = (opt) => {
        this.setState({ selectedDoctor: opt }, () => this.loadWorkSchedule());
    }

    handlePrevWeek = () => {
        this.setState(prev => ({
            currentWeekStart: moment(prev.currentWeekStart).subtract(7, 'days').valueOf()
        }), () => this.loadWorkSchedule());
    }

    handleNextWeek = () => {
        this.setState(prev => ({
            currentWeekStart: moment(prev.currentWeekStart).add(7, 'days').valueOf()
        }), () => this.loadWorkSchedule());
    }

    handleThisWeek = () => {
        this.setState({
            currentWeekStart: moment().startOf('isoWeek').valueOf()
        }, () => this.loadWorkSchedule());
    }

    toggleShift = (dayKey, shiftKey) => {
        let { scheduleData } = this.state;
        let newSchedule = { ...scheduleData };
        let daySchedule = newSchedule[dayKey] || {};
        daySchedule[shiftKey] = !daySchedule[shiftKey];
        newSchedule[dayKey] = daySchedule;
        this.setState({ scheduleData: newSchedule });
    }

    handleSaveSchedule = async () => {
        let { selectedDoctor, currentWeekStart, scheduleData } = this.state;
        if (!selectedDoctor || !selectedDoctor.value) {
            toast.error('Vui lòng chọn bác sĩ!');
            return;
        }
        this.setState({ isShowLoading: true });
        try {
            let res = await saveDoctorWorkSchedule({
                doctorId: selectedDoctor.value,
                weekStart: new Date(currentWeekStart).getTime(),
                schedule: scheduleData
            });
            if (res && res.errCode === 0) {
                toast.success('Lưu lịch làm việc thành công!');
                this.setState({ isShowLoading: false });
            } else {
                toast.error('Lưu thất bại!');
                this.setState({ isShowLoading: false });
            }
        } catch (e) {
            toast.error('Lưu thất bại!');
            this.setState({ isShowLoading: false });
        }
    }

    isDayOnLeave = (dayKey) => {
        let { leaveData, currentWeekStart } = this.state;
        if (!leaveData || leaveData.length === 0) return false;

        let dayIndex = WEEKDAYS.findIndex(d => d.key === dayKey);
        let dayDate = moment(currentWeekStart).add(dayIndex, 'days');

        return leaveData.some(leave => {
            let start = moment(+leave.startDate);
            let end = moment(+leave.endDate);
            return dayDate.isBetween(start, end, 'day', '[]');
        });
    }

    render() {
        let { listDoctors, scheduleData, isShowLoading, currentWeekStart } = this.state;

        let weekStart = moment(currentWeekStart);
        let weekEnd = moment(currentWeekStart).add(6, 'days');
        let weekLabel = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="manage-work-schedule-container">
                    <div className="mws-title">Lịch làm việc bác sĩ</div>

                    <div className="mws-controls">
                        <div className="doctor-select">
                            <label>Chọn bác sĩ</label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeDoctor}
                                options={listDoctors}
                                placeholder="Chọn bác sĩ..."
                            />
                        </div>
                        <div className="week-nav">
                            <button className="btn btn-outline-secondary" onClick={this.handlePrevWeek}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <span className="week-label">{weekLabel}</span>
                            <button className="btn btn-outline-secondary" onClick={this.handleNextWeek}>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                            <button className="btn btn-outline-primary btn-sm ml-2" onClick={this.handleThisWeek}>
                                Tuần này
                            </button>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="schedule-grid">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th className="shift-header">Ca làm việc</th>
                                    {WEEKDAYS.map((day, idx) => {
                                        let dayDate = moment(currentWeekStart).add(idx, 'days');
                                        let isLeave = this.isDayOnLeave(day.key);
                                        let isToday = dayDate.isSame(moment(), 'day');
                                        return (
                                            <th key={day.key}
                                                className={`day-header ${isToday ? 'today' : ''} ${isLeave ? 'on-leave' : ''}`}>
                                                <div>{day.label}</div>
                                                <div className="day-date">{dayDate.format('DD/MM')}</div>
                                                {isLeave && <div className="leave-tag">NGHỈ</div>}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {SHIFTS.map(shift => (
                                    <tr key={shift.key}>
                                        <td className="shift-cell">
                                            <div className="shift-name">{shift.label}</div>
                                        </td>
                                        {WEEKDAYS.map(day => {
                                            let isLeave = this.isDayOnLeave(day.key);
                                            let isActive = scheduleData[day.key]?.[shift.key] || false;
                                            return (
                                                <td key={day.key}
                                                    className={`schedule-cell ${isActive ? 'active' : ''} ${isLeave ? 'leave-cell' : ''}`}
                                                    onClick={() => !isLeave && this.toggleShift(day.key, shift.key)}>
                                                    {isLeave ? (
                                                        <i className="fas fa-minus text-muted"></i>
                                                    ) : isActive ? (
                                                        <i className="fas fa-check-circle text-success"></i>
                                                    ) : (
                                                        <i className="far fa-circle text-muted"></i>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mws-legend">
                        <span><i className="fas fa-check-circle text-success"></i> Làm việc</span>
                        <span><i className="far fa-circle text-muted"></i> Không làm</span>
                        <span><i className="fas fa-minus text-muted"></i> Nghỉ phép</span>
                        <span className="today-legend">Hôm nay</span>
                    </div>

                    <div className="mws-actions">
                        <button className="btn btn-primary btn-lg" onClick={this.handleSaveSchedule}>
                            <i className="fas fa-save"></i> Lưu lịch làm việc
                        </button>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageWorkSchedule);
