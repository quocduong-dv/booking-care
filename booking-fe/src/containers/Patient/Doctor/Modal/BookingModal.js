import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './BookingModal.scss';
import { Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker';
import * as actions from '../../../../store/actions'
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';
import { postPatientBookingAppointment, createPaymentUrlService, validateVoucherService } from '../../../../services/userService';
import { toast } from "react-toastify";
import LoadingOverlay from 'react-loading-overlay';
import moment from 'moment';
class BookingModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            phoneNumber: '',
            email: '',
            address: '',
            reason: '',
            birthday: '',
            selectedGender: '',
            doctorId: '',
            genders: '',
            timType: '',
            isShowLoading: false,
            paymentMethod: 'cash',
            voucherCode: '',
            voucherMessage: '',
            voucherDiscount: 0,
            voucherOk: false,
            insuranceNumber: '',
            insuranceProvider: ''
        }
    }

    getBasePrice = () => {
        const dt = this.props.dataTime;
        try {
            const vi = dt && dt.doctorData && dt.doctorData.Doctor_Infor
                && dt.doctorData.Doctor_Infor.priceTypeData
                && dt.doctorData.Doctor_Infor.priceTypeData.valueVi;
            const n = parseInt(vi, 10);
            return isNaN(n) ? 0 : n;
        } catch (e) { return 0; }
    }

    checkVoucher = async () => {
        if (!this.state.voucherCode) {
            this.setState({ voucherMessage: 'Nhap ma giam gia', voucherOk: false, voucherDiscount: 0 });
            return;
        }
        const amount = this.getBasePrice();
        try {
            const r = await validateVoucherService(this.state.voucherCode.trim().toUpperCase(), amount);
            if (r && r.errCode === 0) {
                this.setState({
                    voucherOk: true,
                    voucherDiscount: r.discount || 0,
                    voucherMessage: `Ap dung thanh cong -${Number(r.discount).toLocaleString('vi-VN')} VND`
                });
            } else {
                this.setState({
                    voucherOk: false, voucherDiscount: 0,
                    voucherMessage: (r && r.errMessage) || 'Ma khong hop le'
                });
            }
        } catch (e) {
            this.setState({ voucherMessage: 'Loi ket noi', voucherOk: false });
        }
    }
    async componentDidMount() {
        this.props.getGenders();

    }

    //
    buildDataGender = (data) => {
        let result = [];
        let language = this.props.language;
        if (data && data.length > 0) {
            data.map(item => {
                let object = {};
                object.label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
                object.value = item.keyMap;
                result.push(object)
            })
        }
        return result;
    }
    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {
            this.setState({
                genders: this.buildDataGender(this.props.genders)
            })
        }
        //
        if (this.props.genders !== prevProps.genders) {
            this.setState({
                genders: this.buildDataGender(this.props.genders)
            })

        }
        if (this.props.dataTime !== prevProps.dataTime) {
            if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
                let doctorId = this.props.dataTime.doctorId;
                let timeType = this.props.dataTime.timeType;
                this.setState({
                    doctorId: doctorId,
                    timeType: timeType
                })
            }
        }

    }
    handleOnchangeInput = (event, id) => {
        let valueInput = event.target.value;
        let stateCopy = { ...this.state };
        stateCopy[id] = valueInput;
        this.setState({
            ...stateCopy
        })
    }
    //
    handleOnchangeDatePicker = (date) => {
        this.setState({
            birthday: date[0]
        })
    }
    //
    handleChangeSelect = (selectedOption) => {
        this.setState({ selectedGender: selectedOption });
    }
    //
    handleConfirmBooking = async () => {
        //validate input
        this.setState({
            isShowLoading: true
        })
        let date = new Date(this.state.birthday).getTime();
        let timeString = this.buildTimeBooking(this.props.dataTime)
        let timeOnly = this.buildTimeOnly(this.props.dataTime)
        let doctorName = this.buildDoctorName(this.props.dataTime)
        let res = await postPatientBookingAppointment({
            fullName: this.state.fullName,
            phoneNumber: this.state.phoneNumber,
            email: this.state.email,
            address: this.state.address,
            reason: this.state.reason,
            date: this.props.dataTime.date,
            birthday: date,
            selectedGender: this.state.selectedGender.value,
            doctorId: this.state.doctorId,
            timeType: this.state.timeType,
            language: this.props.language,
            timeString: timeString,
            timeOnly: timeOnly,
            doctorName: doctorName,
            paymentMethod: this.state.paymentMethod,
            voucherCode: this.state.voucherOk ? this.state.voucherCode.trim().toUpperCase() : null,
            insuranceNumber: this.state.insuranceNumber || null,
            insuranceProvider: this.state.insuranceProvider || null

        })
        if (res && res.errCode === 0) {
            if (this.state.paymentMethod === 'vnpay' && res.bookingId && res.amount > 0) {
                let payRes = await createPaymentUrlService({
                    bookingId: res.bookingId,
                    amount: res.amount,
                    orderInfo: `Thanh toan lich kham #${res.bookingId} - ${doctorName}`
                });
                this.setState({ isShowLoading: false });
                if (payRes && payRes.errCode === 0 && payRes.paymentUrl) {
                    toast.info("Dang chuyen den cong thanh toan VNPay...");
                    this.props.closeBookingClose();
                    window.location.href = payRes.paymentUrl;
                    return;
                } else {
                    toast.error(payRes?.errMessage || "Tao URL thanh toan that bai");
                    return;
                }
            }
            this.setState({ isShowLoading: false });
            toast.success("Booking a new appointment success !")
            this.props.closeBookingClose();
        } else {
            this.setState({ isShowLoading: false });
            toast.error("Booking a new appointment error ! ")
        }
    }
    handleChangePaymentMethod = (method) => {
        this.setState({ paymentMethod: method });
    }
    //
    buildTimeBooking = (dataTime) => {
        let { language } = this.props;

        if (dataTime && !_.isEmpty(dataTime)) {
            let time = language === LANGUAGES.VI ?
                dataTime.timeTypeData.valueVi : dataTime.timeTypeData.valueEn;
            let date = language === LANGUAGES.VI ?
                moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
                :
                moment.unix(+dataTime.date / 1000).locale('en').format('ddd - MM/DD/YYYY')
            return `  ${time} - ${date}`

        }
        return ''

    }
    buildTimeOnly = (dataTime) => {
        let { language } = this.props;
        if (dataTime && !_.isEmpty(dataTime) && dataTime.timeTypeData) {
            return language === LANGUAGES.VI
                ? dataTime.timeTypeData.valueVi
                : dataTime.timeTypeData.valueEn;
        }
        return '';
    }
    buildDoctorName = (dataTime) => {
        let { language } = this.props;

        if (dataTime && !_.isEmpty(dataTime)) {
            let name = language === LANGUAGES.VI ?
                `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName}`
                :
                `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName}`
            return name;

        }
        return ''

    }
    render() {
        //toggle = {}
        let { isOpenModal, closeBookingClose, dataTime } = this.props;
        let doctorId = '';
        if (dataTime && !_.isEmpty(dataTime)) {
            doctorId = dataTime.doctorId
        }
        //
        return (
            <LoadingOverlay
                active={this.state.isShowLoading}
                spinner
                text='loading....'>
                <Modal
                    isOpen={isOpenModal} className={'booking-modal-container'}
                    size="lg" centered >
                    <div className="booking-modal-content">
                        <div className="booking-modal-header">
                            <span className="left"> <FormattedMessage id="patient.booking-modal.title" /></span>
                            <span className="right" onClick={closeBookingClose}><i className="fas fa-times"></i></span>

                        </div>
                        <div className="booking-modal-body">
                            {/* {JSON.stringify(dataTime)} */}
                            <div className="doctor-infor">
                                <ProfileDoctor
                                    doctorId={doctorId}
                                    isShowDescriptionDoctor={false}
                                    dataTime={dataTime}
                                    isShowLinkDetail={false}
                                    isShowPrice={true}
                                />
                            </div>

                            <div className="row">
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.fullName" /></label>
                                    <input className="form-control"
                                        value={this.state.fullName}
                                        onChange={(event) => this.handleOnchangeInput(event, 'fullName')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.phoneNumber" /></label>
                                    <input className="form-control"
                                        value={this.state.phoneNumber}
                                        onChange={(event) => this.handleOnchangeInput(event, 'phoneNumber')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.email" /></label>
                                    <input className="form-control"
                                        value={this.state.email}
                                        onChange={(event) => this.handleOnchangeInput(event, 'email')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.address" /></label>
                                    <input className="form-control"
                                        value={this.state.address}
                                        onChange={(event) => this.handleOnchangeInput(event, 'address')} />
                                </div>
                                <div className="col-12 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.reason" /></label>
                                    <input className="form-control"
                                        value={this.state.reason}
                                        onChange={(event) => this.handleOnchangeInput(event, 'reason')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.birthday" /></label>
                                    <DatePicker
                                        onChange={this.handleOnchangeDatePicker}
                                        className="form-control"
                                        value={this.state.birthday}


                                    />
                                </div>
                                <div className="col-6 form-group">
                                    <label><FormattedMessage id="patient.booking-modal.genders" /></label>
                                    <Select
                                        value={this.state.selectedGender}
                                        onChange={this.handleChangeSelect}
                                        options={this.state.genders}
                                    />

                                </div>
                                <div className="col-12 form-group">
                                    <label>Ma giam gia (neu co)</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input
                                            className="form-control"
                                            style={{ flex: 1 }}
                                            placeholder="VD: WELCOME10"
                                            value={this.state.voucherCode}
                                            onChange={(e) => this.setState({
                                                voucherCode: e.target.value.toUpperCase(),
                                                voucherOk: false,
                                                voucherDiscount: 0,
                                                voucherMessage: ''
                                            })}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={this.checkVoucher}
                                        >Ap dung</button>
                                    </div>
                                    {this.state.voucherMessage && (
                                        <div style={{
                                            fontSize: 13,
                                            marginTop: 4,
                                            color: this.state.voucherOk ? '#188038' : '#d93025'
                                        }}>{this.state.voucherMessage}</div>
                                    )}
                                </div>
                                <div className="col-6 form-group">
                                    <label>So the BHYT (neu co)</label>
                                    <input className="form-control"
                                        value={this.state.insuranceNumber}
                                        onChange={(event) => this.handleOnchangeInput(event, 'insuranceNumber')} />
                                </div>
                                <div className="col-6 form-group">
                                    <label>Don vi BHYT</label>
                                    <input className="form-control"
                                        placeholder="VD: BHYT, Bao Viet..."
                                        value={this.state.insuranceProvider}
                                        onChange={(event) => this.handleOnchangeInput(event, 'insuranceProvider')} />
                                </div>
                                <div className="col-12 form-group">
                                    <label>Phuong thuc thanh toan / Payment method</label>
                                    <div className="payment-method-wrapper" style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cash"
                                                checked={this.state.paymentMethod === 'cash'}
                                                onChange={() => this.handleChangePaymentMethod('cash')}
                                            />
                                            {' '}Tien mat tai phong kham
                                        </label>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="vnpay"
                                                checked={this.state.paymentMethod === 'vnpay'}
                                                onChange={() => this.handleChangePaymentMethod('vnpay')}
                                            />
                                            {' '}VNPay (ATM / QR / Visa)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="booking-modal-footer">
                            <button className="btn-booking-confirm"
                                onClick={() => this.handleConfirmBooking()}>
                                <FormattedMessage id="patient.booking-modal.btnConfirm" /></button>
                            <button className="btn-booking-cancel"
                                onClick={closeBookingClose}>
                                <FormattedMessage id="patient.booking-modal.btnCancel" /></button>
                        </div>
                    </div>



                </Modal>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        genders: state.admin.genders,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getGenders: () => dispatch(actions.fetchGenderStart()),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
