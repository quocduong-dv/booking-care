import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ManagePatient.scss';
import DatePicker from '../../../components/Input/DatePicker';
import { getAllPatientForDoctor, postSendRemedy } from '../../../services/userService';
import moment, { lang } from 'moment';
import { LANGUAGES } from '../../../utils';
import RemedyModal from './RemedyModal';
import EmrModal from './EmrModal';
import LabResultModal from './LabResultModal';
import CreateAppointmentModal from '../Appointment/CreateAppointmentModal';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
class ManagePatient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: moment(new Date()).add(0, 'days').startOf('day').valueOf(),
            dataPatient: [],
            isOpenRemedyModal: false,
            dataModal: {},
            isShowLoading: false,
            showCreateModal: false,
            emrModal: null,
            labModal: null
        }
    }
    async componentDidMount() {

        this.getDataPatient()
    }
    getDataPatient = async () => {
        let { user } = this.props;
        let { currentDate } = this.state;

        let formateDate = new Date(currentDate).getTime(); // format date
        let res = await getAllPatientForDoctor({
            doctorId: user.id,
            date: formateDate

        })
        if (res && res.errCode === 0) {
            this.setState({
                dataPatient: res.data
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {

        }

    }
    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        }, async () => {

            await this.getDataPatient()
        })
    }

    handleAppointmentCreated = async (info) => {
        if (info?.date) {
            const m = String(info.date).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m) {
                const d = new Date(+m[3], +m[2] - 1, +m[1]);
                d.setHours(0, 0, 0, 0);
                this.setState({ currentDate: d.getTime() }, () => this.getDataPatient());
                return;
            }
        }
        await this.getDataPatient();
    }
    handleBtnConfirm = (item) => {

        let data = {
            doctorId: item.doctorId,
            patientId: item.patientId,
            email: item.patientData.email,
            timeType: item.timeType,
            patientName: item.patientData.firstName
        }
        this.setState({
            isOpenRemedyModal: true,
            dataModal: data
        })
    }
    closeRemedyModal = () => {
        this.setState({
            isOpenRemedyModal: false,
            dataModal: {}
        })
    }
    sendRemedy = async (dataChild) => {
        let { dataModal } = this.state;
        this.setState({
            isShowLoading: true
        })
        let res = await postSendRemedy({
            email: dataChild.email,
            imgBase64: dataChild.imgBase64,
            doctorId: dataModal.doctorId,
            patientId: dataModal.patientId,
            timeType: dataModal.timeType,
            language: this.props.language,
            patientName: dataModal.patientName
        });
        if (res && res.errCode === 0) {
            this.setState({
                isShowLoading: false
            })
            toast.success('Send Remedy success');
            this.closeRemedyModal();
            await this.getDataPatient();
        } else {
            this.setState({
                isShowLoading: false
            })
            toast.error('Something wrongs...')
        }
    }
    render() {
        let { language, user } = this.props;
        let { dataPatient, isOpenRemedyModal, dataModal, showCreateModal } = this.state;
        return (
            <>
                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                >
                    <div className="manage-patient-container">
                        <div className="m-p-header">
                            <div className="m-p-title">Quản lý bệnh nhân khám bệnh</div>
                            <button className="btn btn-success btn-add-patient"
                                onClick={() => this.setState({ showCreateModal: true })}>
                                <i className="fas fa-user-plus"></i> Them benh nhan
                            </button>
                        </div>
                        <div className="manage-patient-body row">
                            <div className="col-4 form-group mb-2 ">
                                <label>Chọn ngày khám</label>
                                <DatePicker
                                    onChange={this.handleOnchangeDatePicker}
                                    className="form-control"
                                    value={this.state.currentDate}

                                />
                            </div>
                            <div></div>
                            <div className="col-12 table-manage-patient">
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <th>STT</th>
                                            <th>Thời gian</th>
                                            <th > Họ và Tên</th>
                                            <th>Địa chỉ</th>
                                            <th >Giới tính</th>
                                            <th>Actions</th>

                                        </tr>
                                        {dataPatient && dataPatient.length > 0 ?
                                            dataPatient.map((item, index) => {
                                                let time = language === LANGUAGES.VI ?
                                                    item.timeTypeDataPatient.valueVi : item.timeTypeDataPatient.valueEn;
                                                let gender = language === LANGUAGES.VI ?
                                                    item.patientData.genderData.valueVi : item.patientData.genderData.valueEn;
                                                return (
                                                    <tr key={index}>
                                                        {/* stt */}
                                                        <td>{index + 1}</td>
                                                        <td>{time}</td>
                                                        <td>{item.patientData.firstName}</td>
                                                        <td>{item.patientData.address}</td>
                                                        <td>{gender || 'N/A'}</td>
                                                        <td>
                                                            <button className="mp-btn-emr"
                                                                onClick={() => this.setState({
                                                                    emrModal: {
                                                                        bookingId: item.id,
                                                                        patientId: item.patientId,
                                                                        doctorId: item.doctorId
                                                                    }
                                                                })}>
                                                                Hồ sơ khám
                                                            </button>
                                                            <button className="mp-btn-lab"
                                                                style={{ background: '#28c76f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 10px', marginRight: 4 }}
                                                                onClick={() => this.setState({
                                                                    labModal: {
                                                                        bookingId: item.id,
                                                                        patientId: item.patientId
                                                                    }
                                                                })}>
                                                                Xét nghiệm
                                                            </button>
                                                            <button className="mp-btn-confirm"
                                                                onClick={() => this.handleBtnConfirm(item)}>Xác nhận</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                            :
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center' }}> no data</td>
                                            </tr>
                                        }

                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </div>

                    <RemedyModal
                        isOpenModal={isOpenRemedyModal}
                        dataModal={dataModal}
                        closeRemedyModal={this.closeRemedyModal}
                        sendRemedy={this.sendRemedy}
                    />

                    <CreateAppointmentModal
                        isOpen={showCreateModal}
                        toggle={() => this.setState({ showCreateModal: !this.state.showCreateModal })}
                        lockedDoctorId={user?.id}
                        doctorOptions={user ? [{
                            value: user.id,
                            label: `${user.lastName || ''} ${user.firstName || ''}`.trim()
                        }] : []}
                        onCreated={this.handleAppointmentCreated}
                    />

                    {this.state.emrModal && (
                        <EmrModal
                            isOpen={!!this.state.emrModal}
                            toggle={() => this.setState({ emrModal: null })}
                            bookingId={this.state.emrModal.bookingId}
                            patientId={this.state.emrModal.patientId}
                            doctorId={this.state.emrModal.doctorId}
                        />
                    )}

                    {this.state.labModal && (
                        <LabResultModal
                            isOpen={!!this.state.labModal}
                            toggle={() => this.setState({ labModal: null })}
                            bookingId={this.state.labModal.bookingId}
                            patientId={this.state.labModal.patientId}
                        />
                    )}

                </LoadingOverlay>
            </>
        );
    }
}
// fun call redux
const mapStateToProps = state => {
    return {
        language: state.app.language,
        user: state.user.userInfo,

    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);
