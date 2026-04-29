import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker from '../../../components/Input/DatePicker';
import {
    getQueueByDoctorService,
    assignQueueNumbersService,
    callNextPatientService
} from '../../../services/userService';
import { onSocket, joinRooms, leaveRooms } from '../../../services/socket';
import './QueuePanel.scss';

class QueuePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).startOf('day').valueOf(),
            queue: [],
            isShowLoading: false
        };
        this._unsubs = [];
    }

    async componentDidMount() {
        const { user } = this.props;
        if (user && user.id) {
            joinRooms({ role: 'R2', userId: user.id, doctorId: user.id });
        }
        await this.loadQueue();
        this._unsubs.push(onSocket('queue:called', () => this.loadQueue()));
        this._unsubs.push(onSocket('queue:done', () => this.loadQueue()));
        this._unsubs.push(onSocket('queue:refreshed', () => this.loadQueue()));
        this._unsubs.push(onSocket('booking:new', () => this.loadQueue()));
        this._unsubs.push(onSocket('booking:statusChanged', () => this.loadQueue()));
    }

    componentWillUnmount() {
        this._unsubs.forEach(u => typeof u === 'function' && u());
        const { user } = this.props;
        if (user && user.id) leaveRooms({ doctorId: user.id });
    }

    loadQueue = async () => {
        const { user } = this.props;
        if (!user || !user.id) return;
        this.setState({ isShowLoading: true });
        try {
            const formateDate = new Date(this.state.currentDate).getTime();
            const res = await getQueueByDoctorService(user.id, formateDate);
            if (res && res.errCode === 0) {
                this.setState({ queue: res.data || [], isShowLoading: false });
            } else {
                this.setState({ queue: [], isShowLoading: false });
            }
        } catch (e) {
            console.log(e);
            this.setState({ isShowLoading: false });
        }
    };

    handleDateChange = (d) => {
        this.setState({ currentDate: d[0] }, this.loadQueue);
    };

    handleAssignQueue = async () => {
        const { user } = this.props;
        const formateDate = new Date(this.state.currentDate).getTime();
        const res = await assignQueueNumbersService({ doctorId: user.id, date: formateDate });
        if (res && res.errCode === 0) {
            toast.success(`Da gan so thu tu cho ${res.count} benh nhan`);
            this.loadQueue();
        } else {
            toast.error(res?.errMessage || 'That bai');
        }
    };

    handleCallNext = async () => {
        const { user } = this.props;
        const formateDate = new Date(this.state.currentDate).getTime();
        const res = await callNextPatientService({ doctorId: user.id, date: formateDate });
        if (res && res.errCode === 0) {
            toast.success(`Da goi benh nhan so ${res.data?.queueNumber || ''}`);
        } else if (res?.errCode === 2) {
            toast.info('Khong con benh nhan nao cho');
        } else {
            toast.error(res?.errMessage || 'That bai');
        }
        this.loadQueue();
    };

    statusLabel = (s) => {
        switch (s) {
            case 'waiting': return { text: 'Cho', cls: 'st-wait' };
            case 'in_progress': return { text: 'Dang kham', cls: 'st-inprog' };
            case 'done': return { text: 'Da kham', cls: 'st-done' };
            default: return { text: '-', cls: '' };
        }
    };

    render() {
        const { queue, isShowLoading, currentDate } = this.state;
        const calling = queue.find(q => q.servedStatus === 'in_progress');
        const waiting = queue.filter(q => q.servedStatus === 'waiting' || !q.servedStatus);
        const done = queue.filter(q => q.servedStatus === 'done');

        return (
            <LoadingOverlay active={isShowLoading} spinner text="Loading...">
                <div className="queue-panel-container">
                    <h2>Bang dieu khien hang doi</h2>

                    <div className="controls">
                        <div className="date-picker">
                            <label>Ngay kham</label>
                            <DatePicker
                                onChange={this.handleDateChange}
                                className="form-control"
                                value={currentDate}
                            />
                        </div>
                        <button className="btn-assign" onClick={this.handleAssignQueue}>
                            <i className="fas fa-list-ol" /> Gan so thu tu
                        </button>
                        <button className="btn-call-next" onClick={this.handleCallNext}>
                            <i className="fas fa-bullhorn" /> Goi benh nhan tiep theo
                        </button>
                        <button className="btn-reload" onClick={this.loadQueue}>
                            <i className="fas fa-sync-alt" /> Tai lai
                        </button>
                    </div>

                    <div className="current-display">
                        <div className="label">Dang kham</div>
                        <div className="number">
                            {calling ? `#${calling.queueNumber || '?'}` : '---'}
                        </div>
                        {calling && calling.patientData && (
                            <div className="patient-name">
                                {calling.patientData.firstName || calling.patientData.email}
                            </div>
                        )}
                    </div>

                    <div className="stats-row">
                        <div className="stat"><span>{waiting.length}</span> cho</div>
                        <div className="stat in-prog"><span>{calling ? 1 : 0}</span> dang kham</div>
                        <div className="stat done"><span>{done.length}</span> da kham</div>
                    </div>

                    <div className="queue-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Benh nhan</th>
                                    <th>Email</th>
                                    <th>SDT</th>
                                    <th>Gio</th>
                                    <th>Trang thai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.length === 0 && (
                                    <tr><td colSpan={6} className="empty">Khong co benh nhan</td></tr>
                                )}
                                {queue.map((q) => {
                                    const st = this.statusLabel(q.servedStatus || 'waiting');
                                    return (
                                        <tr key={q.id} className={q.servedStatus === 'in_progress' ? 'row-active' : ''}>
                                            <td className="num">{q.queueNumber || '-'}</td>
                                            <td>{q.patientData?.firstName || q.patientData?.email || '-'}</td>
                                            <td>{q.patientData?.email || '-'}</td>
                                            <td>{q.patientData?.phonenumber || '-'}</td>
                                            <td>{q.timeTypeDataPatient?.valueVi || q.timeType || '-'}</td>
                                            <td><span className={`badge ${st.cls}`}>{st.text}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => ({
    user: state.user.userInfo,
    language: state.app.language
});

export default connect(mapStateToProps)(QueuePanel);
