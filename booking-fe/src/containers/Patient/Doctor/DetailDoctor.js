import React, { Component } from 'react';
import { connect } from "react-redux";
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import HomeFooter from '../../HomePage/HomeFooter';
import DoctorReviews from '../Review/DoctorReviews';
import WaitlistButton from '../Waitlist/WaitlistButton';
class DetailDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detailDoctor: {},
            currentDoctorId: -1,
        }
    }
    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;
            this.setState({
                currentDoctorId: id
            })
            let res = await getDetailInforDoctor(id);
            if (res && res.errCode === 0) {
                this.setState({
                    detailDoctor: res.data,

                })
            }

        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {

    }
    render() {
        let { language } = this.props;
        let { detailDoctor } = this.state;
        let nameVi = '', nameEn = '';
        if (detailDoctor && detailDoctor.positionData) {
            nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName} `;
            nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
        }

        return (
            <>
                <HomeHeader
                    isShowBanner={false} />
                <div className="doctor-detail-container">
                    <div className="intro-doctor">
                        <div className="content-left" style={{ backgroundImage: `url(${detailDoctor && detailDoctor.image ? detailDoctor.image : ''})` }}
                        >

                        </div>
                        <div className="content-right">
                            <div className="up">
                                {language === LANGUAGES.VI ? nameVi : nameEn}
                            </div>
                            <div className="down">
                                {detailDoctor.Markdown && detailDoctor.Markdown.description
                                    && <span>
                                        {detailDoctor.Markdown.description}
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="schedule-doctor">
                        <div className="content-left">
                            <DoctorSchedule
                                doctorIdFromParent={this.state.currentDoctorId} />
                        </div>
                        <div className="content-right">
                            <DoctorExtraInfor
                                doctorIdFromParent={this.state.currentDoctorId} />

                        </div>
                    </div>
                    <div className="detail-infro-doctor">
                        {detailDoctor && detailDoctor.Markdown && detailDoctor.Markdown.contentHTML &&
                            <div dangerouslySetInnerHTML={{ __html: detailDoctor.Markdown.contentHTML }}>
                            </div>}
                    </div>
                    <div className="waitlist-wrap" style={{ padding: '0 20px' }}>
                        {this.state.currentDoctorId > 0 && (
                            <WaitlistButton doctorId={this.state.currentDoctorId} history={this.props.history} />
                        )}
                    </div>
                    <div className="comment-doctor">
                        <DoctorReviews doctorId={this.state.currentDoctorId} />
                    </div>
                    <div className="end-handbook"> <HomeFooter /></div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
