import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './DetailHanBook.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getDetailHandBookById, getAllCodeService } from '../../../services/userService';
import _, { get } from 'lodash';
import { LANGUAGES } from '../../../utils';
import HomeFooter from '../../HomePage/HomeFooter';
class DetailHanBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrDoctorId: [],
            dataDetailHandBook: {},

        }
    }
    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {
            let id = this.props.match.params.id;

            let res = await getDetailHandBookById({
                id: id,
            });
            // if (res && res.errCode === 0) {
            //     let data = res.data;

            //     let arrDoctorId = [];
            //     if (data && !_.isEmpty(res.data)) {
            //         let arr = data.doctorClinic;
            //         if (arr && arr.length > 0) {
            //             arr.map(item => {
            //                 arrDoctorId.push(item.doctorId)
            //             })
            //         }
            //     }
            this.setState({
                dataDetailHandBook: res.data,
                //arrDoctorId: arrDoctorId,


            })

        }

    }


    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {

        }

    }


    render() {
        let { dataDetailHandBook } = this.state;
        let { language } = this.props

        return (
            <div className="detail-specialty-container">
                <HomeHeader />
                <div className="detail-specialty-body">
                    <div className="description-specialty">
                        {dataDetailHandBook && !_.isEmpty(dataDetailHandBook)
                            &&
                            <div dangerouslySetInnerHTML={{ __html: dataDetailHandBook.descriptionHTML }}>
                            </div>
                        }
                    </div>
                    {/* {arrDoctorId && arrDoctorId.length > 0 &&
                        arrDoctorId.map((item, index) => {
                            return (
                                <div className="each-doctor" key={index}>
                                    <div className="dt-content-left">
                                        <div className="profile-doctor">
                                            <ProfileDoctor
                                                doctorId={item}
                                                isShowDescriptionDoctor={true}
                                                isShowLinkDetail={true}
                                                isShowPrice={false}
                                            />
                                        </div>

                                    </div>
                                    <div className="dt-content-right">
                                        <div className="doctor-schedule">
                                            <DoctorSchedule
                                                doctorIdFromParent={item}
                                            />
                                        </div>
                                        <div className="doctor-extra-infor">
                                            <DoctorExtraInfor doctorIdFromParent={item} />
                                        </div>


                                    </div>
                                </div>

                            )
                        })
                    } */}


                </div>
                <div className="end-handbook"> <HomeFooter /></div>

            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailHanBook);
