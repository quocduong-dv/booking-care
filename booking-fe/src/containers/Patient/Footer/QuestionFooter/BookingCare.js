import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './BookingCare.scss';
import { LANGUAGES } from '../../../../utils';
import NumericFormat from 'react-number-format';
import HomeHeader from '../../../HomePage/HomeHeader';
import HomeFooter from '../../../HomePage/HomeFooter';
// class BookingCare extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             isAnswerVisible: false,

//         }
//     }
//     async componentDidMount() {


//     }


//     async componentDidUpdate(prevProps, prevState, snapshot) {
//         // tạo thay đổi ngôn ngữ 
//         if (this.props.language !== prevProps.language) {

//         }

//     }
//     // show and hidden content
//     toggleAnswerVisibility = () => {
//         this.setState((prevState) => ({
//             isAnswerVisible: !prevState.isAnswerVisible,
//         }));
//     };

//     render() {
//         let { isAnswerVisible } = this.state;
//         return (
//             <div className="container-question">
//                 <HomeHeader />
//                 <div className="container_vung-bao">

//                     <div className="breadcrumb">
//                         <a href="home">Trang Chủ</a> » <a href="/benh-nhan-thuong-hoi">Câu hỏi thường gặp</a> »
//                         <p className="question-title">Về BookingCare</p>
//                     </div>
//                     <h1 className="faq-title">Về BookingCare</h1>
//                     <div className="faq">
//                         <h3
//                             onClick={this.toggleAnswerVisibility}

//                         >
//                             BookingCare nỗ lực vì điều gì?
//                         </h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 BookingCare nỗ lực xây dựng Nền tảng Y tế chăm sóc sức khỏe
//                                 toàn diện hàng đầu Việt Nam vươn tầm khu vực Asean, giúp bệnh
//                                 nhân lựa chọn dịch vụ y tế phù hợp nhằm nâng cao hiệu quả chữa
//                                 bệnh, tiết kiệm thời gian và chi phí.
//                             </div>
//                         )}

//                     </div>
//                     <div className="faq">
//                         <h3 onClick={this.toggleAnswerVisibility}>BookingCare có phải là một bệnh viện, hay phòng khám không?</h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 Không.<br></br>

//                                 BookingCare là Nền tảng Y tế Chăm sóc sức khỏe toàn diện kết nối người dùng đến với dịch vụ y tế -
//                                 chăm sóc sức khỏe chất lượng, hiệu quả và tin cậy.
//                                 BookingCare kết nối mạng lưới bác sĩ giỏi ở nhiều bệnh viện, phòng khám khác nhau. Có thể hình dung,
//                                 BookingCare hoạt động theo mô hình tương tự như Taxi Uber hay Grab trong lĩnh vực Y tế - Chăm sóc sức khỏe.
//                             </div>
//                         )}
//                     </div>
//                     <div className="faq">
//                         <h3 onClick={this.toggleAnswerVisibility}>Mối quan hệ của BookingCare với các bệnh viện, phòng khám là gì?</h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 Đối tác hợp tác. <br></br>

//                                 BookingCare hợp tác với các bệnh viện/phòng khám, cung cấp các thông tin
//                                 về khám chữa bệnh tại bệnh viện/phòng khám cho người bệnh để người bệnh có thể dễ dàng
//                                 lựa chọn bác sĩ phù hợp và đặt lịch nhanh chóng.
//                             </div>
//                         )}
//                     </div>
//                     <div className="faq">
//                         <h3 onClick={this.toggleAnswerVisibility}>BookingCare phù hợp với nhóm bệnh nhân nào?</h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 BookingCare phù hợp với các nhóm bệnh nhân:
//                                 <ul>
//                                     <li>Bệnh không có tính chất cấp cứu</li>
//                                     <li>Bệnh mãn tính cần khám bác sĩ chuyên khoa</li>
//                                     <li>Người bệnh biết rõ về tình trạng bệnh của mình</li>
//                                     <li>Mong muốn chủ động đặt lịch đi khám có kế hoạch</li>
//                                 </ul>
//                             </div>
//                         )}
//                     </div>
//                     <div className="faq">
//                         <h3 onClick={this.toggleAnswerVisibility}>Miễn phí đặt lịch, vậy BookingCare thu phí bằng cách nào?</h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 Các cơ sở y tế sẽ chi trả chi phí dịch vụ cho BookingCare
//                             </div>
//                         )}
//                     </div>
//                     <div className="faq">
//                         <h3 onClick={this.toggleAnswerVisibility}>BookingCare là gì?</h3>
//                         {isAnswerVisible && (
//                             <div className="detail-answer">
//                                 BookingCare là Nền tảng Y tế Chăm sóc sức khỏe toàn diện kết nối người dùng đến với dịch vụ y
//                                 tế - chăm sóc sức khỏe chất lượng, hiệu quả, tin cậy với trên 200 bệnh viện, phòng khám uy tín; trên 1.500
//                                 bác sĩ chuyên khoa giỏi và hàng nghìn dịch vụ y tế chất lượng cao.

//                                 BookingCare kết nối mạng lưới bác sĩ và cơ sở y tế chuyên khoa. Bệnh nhân dễ dàng lựa chọn đúng dịch vụ
//                                 y tế với thông tin đã xác thực và đặt lịch nhanh chóng.
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <HomeFooter />
//             </div>
//         );
//     }
// }
class BookingCare extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openQuestions: [],  // Mảng lưu trạng thái câu hỏi đang mở
        };
    }

    // Toggle câu trả lời của câu hỏi với key tương ứng
    toggleAnswerVisibility = (index) => {
        this.setState((prevState) => {
            const openQuestions = [...prevState.openQuestions];
            // Dùng toán tử ternary để quyết định trạng thái câu hỏi
            openQuestions[index] = openQuestions[index] ? false : true;
            return { openQuestions };
        });
    };


    render() {
        const { openQuestions } = this.state;

        return (
            <div className="container-question">
                <HomeHeader />
                <div className="container_vung-bao">

                    <div className="breadcrumb">
                        <a href="/home">Trang Chủ</a> » <a href="/benh-nhan-thuong-hoi">Câu hỏi thường gặp</a> »
                        <p className="question-title">Về BookingCare</p>
                    </div>
                    <h1 className="faq-title">Về BookingCare</h1>

                    {/* Các câu hỏi và câu trả lời */}
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(0)}>
                            BookingCare nỗ lực vì điều gì?
                        </h3>
                        {openQuestions[0] && (
                            <div className="detail-answer">
                                BookingCare nỗ lực xây dựng Nền tảng Y tế chăm sóc sức khỏe
                                toàn diện hàng đầu Việt Nam vươn tầm khu vực Asean, giúp bệnh
                                nhân lựa chọn dịch vụ y tế phù hợp nhằm nâng cao hiệu quả chữa
                                bệnh, tiết kiệm thời gian và chi phí.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(1)}>
                            BookingCare có phải là một bệnh viện, hay phòng khám không?
                        </h3>
                        {openQuestions[1] && (
                            <div className="detail-answer">
                                Không.<br></br>

                                BookingCare là Nền tảng Y tế Chăm sóc sức khỏe toàn diện kết nối người bệnh đến với dịch vụ y tế -
                                chăm sóc sức khỏe chất lượng, hiệu quả và tin cậy.
                                BookingCare kết nối mạng lưới bác sĩ giỏi ở nhiều bệnh viện, phòng khám khác nhau.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(2)}>
                            Mối quan hệ của BookingCare với các bệnh viện, phòng khám là gì?
                        </h3>
                        {openQuestions[2] && (
                            <div className="detail-answer">
                                Đối tác hợp tác. <br></br>

                                BookingCare hợp tác với các bệnh viện/phòng khám, cung cấp các thông tin
                                về khám chữa bệnh tại bệnh viện/phòng khám cho người bệnh để người bệnh có thể dễ dàng
                                lựa chọn bác sĩ phù hợp và đặt lịch nhanh chóng.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(3)}>
                            BookingCare phù hợp với nhóm bệnh nhân nào?
                        </h3>
                        {openQuestions[3] && (
                            <div className="detail-answer">
                                BookingCare phù hợp với các nhóm bệnh nhân:
                                <ul>
                                    <li>Bệnh không có tính chất cấp cứu</li>
                                    <li>Bệnh mãn tính cần khám bác sĩ chuyên khoa</li>
                                    <li>Người bệnh biết rõ về tình trạng bệnh của mình</li>
                                    <li>Mong muốn chủ động đặt lịch đi khám có kế hoạch</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(4)}>
                            Miễn phí đặt lịch, vậy BookingCare thu phí bằng cách nào?
                        </h3>
                        {openQuestions[4] && (
                            <div className="detail-answer">
                                Các cơ sở y tế sẽ chi trả chi phí dịch vụ cho BookingCare
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(5)}>
                            BookingCare là gì?
                        </h3>
                        {openQuestions[5] && (
                            <div className="detail-answer">
                                BookingCare là Nền tảng Y tế Chăm sóc sức khỏe toàn diện kết nối người dùng đến với dịch vụ y
                                tế - chăm sóc sức khỏe chất lượng, hiệu quả, tin cậy với trên 200 bệnh viện, phòng khám uy tín; trên 1.500
                                bác sĩ chuyên khoa giỏi và hàng nghìn dịch vụ y tế chất lượng cao.

                                BookingCare kết nối mạng lưới bác sĩ và cơ sở y tế chuyên khoa. Bệnh nhân dễ dàng lựa chọn đúng dịch vụ
                                y tế với thông tin đã xác thực và đặt lịch nhanh chóng.
                            </div>
                        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(BookingCare);
