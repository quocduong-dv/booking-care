import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './BookingCare.scss';
import { LANGUAGES } from '../../../../utils';
import NumericFormat from 'react-number-format';
import HomeHeader from '../../../HomePage/HomeHeader';
import HomeFooter from '../../../HomePage/HomeFooter';

class MedicalFacilities extends Component {
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
                        <a href="home">Trang Chủ</a> » <a href="/benh-nhan-thuong-hoi">Câu hỏi thường gặp</a> »
                        <p className="question-title">Cơ sở y tế</p>
                    </div>
                    <h1 className="faq-title">Cơ sở y tế</h1>

                    {/* Các câu hỏi và câu trả lời */}
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(0)}>
                            Bệnh viện và phòng khám trên BookingCare có uy tín không?
                        </h3>
                        {openQuestions[0] && (
                            <div className="detail-answer">
                                Có. BookingCare luôn tìm hiểu kỹ lưỡng và lựa chọn các bệnh viện,
                                phòng khám uy tín để hợp tác nhằm mang đến sự cậy về chất lượng khám chữa bệnh và giá
                                cả dịch vụ phù hợp cho người bệnh và gia đình.<br></br>
                                Ngoài sự chất lượng chuyên môn và dịch vụ, các bệnh viện, phòng khám đối tác trên BookingCare có đủ giấy phép,
                                chứng chỉ hành nghề chuyên môn theo quy định khám chữa bệnh hiện hành.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(1)}>
                            Bệnh viện trên BookingCare là bệnh viện công hay bệnh viên tư?
                        </h3>
                        {openQuestions[1] && (
                            <div className="detail-answer">
                                Cả hai. BookingCare kết nối mạng lưới các cơ sơ y tế cả công và tư để người bệnh có nhiều
                                sự lựa chọn theo bác sĩ, theo chuyên khoa, theo lý do khám hoặc chọn khám theo cơ sở y tế.

                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(2)}>
                            Làm thế nào để tôi biết được địa chỉ của bệnh viện/phòng khám?
                        </h3>
                        {openQuestions[2] && (
                            <div className="detail-answer">
                                Địa chỉ phòng khám/bệnh viện nơi bác sĩ thăm khám được hiển thị rõ ràng
                                trong trang thông tin giới thiệu về bác sĩ hoặc hiển thị trong trang giới thiệu về cơ sở y tế.<br></br>

                                Ngoài ra sau khi xác nhận đặt khám, BookingCare sẽ gửi cho
                                bạn một Hướng dẫn đi khám chi tiết về đường đi đến bệnh viện, phòng khám.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(3)}>
                            Làm thế nào để tôi biết bệnh viện/phòng khám có trang bị các loại thiết bị gì?
                        </h3>
                        {openQuestions[3] && (
                            <div className="detail-answer">
                                Với từng phòng khám/bệnh viện, BookingCare đưa thông tin về chi phí khám của bác sĩ
                                và chi phí dịch vụ liên quan. Chi phí dịch vụ này tương ứng với các loại thiết bị mà phòng khám/bệnh viện hiện có.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(4)}>
                            BookingCare có thể cho tôi biết những bến xe để đến bệnh viện/phòng khám không?
                        </h3>
                        {openQuestions[4] && (
                            <div className="detail-answer">
                                Trước khi bạn đi khám, BookingCare sẽ gửi cho bạn một bản Hướng dẫn đi khám, bao gồm hướng dẫn đường đi đến bệnh
                                viện/phòng khám và bản đồ. Bạn có thể tham khảo thêm để biết được vị trí và đường đi đến bệnh viện/phòng khám
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(5)}>
                            Các bệnh viện công lập trên hệ thống có khám vào thứ 7 và chủ nhật không?
                        </h3>
                        {openQuestions[5] && (
                            <div className="detail-answer">
                                Một số bệnh viện công lập làm việc vào ngày cuối tuần. Bạn sử dụng công cụ tìm kiếm trên trang
                                chủ của BookingCare để vào bệnh viện bạn muốn tìm hiểu và xem thêm thông tin.<br></br>

                                Ngoài ra, bạn có thể để lại yêu cầu trên mục "Hỗ trợ", đội ngũ của chúng tôi hỗ trợ 7
                                ngày/tuần để bạn cập nhật thông tin.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(6)}>
                            Bệnh viện/phòng khám mà BookingCare hỗ trợ đặt lịch có nhận khám cho người nước ngoài không?
                        </h3>
                        {openQuestions[6] && (
                            <div className="detail-answer">
                                Tùy thuộc từng bệnh viện/phòng khám hoặc bác sĩ bạn đặt khám. Vui lòng để lại thông tin
                                hoặc đặt khám với bác sĩ mong muốn để BookingCare hỗ trợ cho bạn. <br></br>

                                Một lưu ý là chi phí khám cho người nước ngoài thường cao hơn vì có
                                thể cần thêm phiên dịch viên hoặc hỗ trợ khám trong quá trình thăm khám
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(7)}>
                            BookingCare hỗ trợ đặt lịch khám được với tất cả các bệnh viện/phòng khám đúng không?
                        </h3>
                        {openQuestions[7] && (
                            <div className="detail-answer">
                                Không. Hiện tại BookingCare hỗ trợ đặt khám với trên 70 bệnh viện/phòng khám công lập và tư nhân
                                tại Hà Nội và Tp. Hồ Chí Minh. Mạng lưới đối tác của chúng tôi luôn tăng trưởng không ngừng.<br></br>

                                Bạn vui lòng truy cập trang web và các ứng dụng của
                                BookingCare để xem thêm thông tin về các cơ sở y tế đang hỗ trợ đặt khám.
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

export default connect(mapStateToProps, mapDispatchToProps)(MedicalFacilities);
