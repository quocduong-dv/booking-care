import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './DetailQuestion.scss';
import { Link } from "react-router-dom";
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
class DetailQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    async componentDidMount() {


    }


    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {

        }

    }

    render() {

        return (
            <div className="detail-question-container">
                <HomeHeader />
                <div className="detail-question-body">
                    <div className="detail-question-title">
                        <h1>Câu hỏi thường gặp</h1>
                    </div>
                    <div className="detail-question">
                        <ul className="link-question">
                            <li><Link className="group-title" to="/booking-care/ve-bookingcare-f1">Về BookingCare</Link></li>
                            <li><Link className="group-title" to="/user-manual/huong-dan-su-dung-f2">Hướng dẫn sử dụng</Link></li>
                            <li><Link className="group-title" to="/about-doctor/ve-bac-si-f3">Về bác sĩ</Link></li>
                            <li><Link className="group-title" to="/medical-facilities/ve-co-so-y-te-f4">Cơ sở y tế</Link></li>
                            <li><Link className="group-title" to="/about-medical-facilities/gia-va-thanh-toan">Giá và thanh toán</Link></li>
                            <li><Link className="group-title" to="/about-insurance/bao-hiem">Bảo hiểm</Link></li>
                            <li><Link className="group-title" to="/customer-benefits/loi-ich-khach-hang">Lợi ích khách hang</Link></li>
                            <li><Link className="group-title" to="/post-surgery-questions-and-answers/hoi-dap-sau-kham">Hỏi đáp sau khám</Link></li>
                            <li><Link className="group-title" to="/health-records/ho-so-suc-khoe">Hồ sơ sức khỏe</Link></li>
                        </ul>
                    </div>
                </div>
                <HomeFooter />
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailQuestion);
