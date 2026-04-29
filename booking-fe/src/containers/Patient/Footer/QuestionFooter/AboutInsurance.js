import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './BookingCare.scss';
import { LANGUAGES } from '../../../../utils';
import NumericFormat from 'react-number-format';
import HomeHeader from '../../../HomePage/HomeHeader';
import HomeFooter from '../../../HomePage/HomeFooter';

class AboutInsurance extends Component {
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
                        <p className="question-title">Hướng dẫn sử dụng</p>
                    </div>
                    <h1 className="faq-title">Hướng dẫn sử dụng</h1>

                    {/* Các câu hỏi và câu trả lời */}
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(0)}>
                            Tôi đặt lịch nhiều lần nhưng bận không đi khám được có sao không?
                        </h3>
                        {openQuestions[0] && (
                            <div className="detail-answer">
                                Khi muốn thay đổi lịch khám vui lòng báo lại để BookingCare hỗ trợ sắp xếp lịch khám giúp bạn
                                và nhường lịch đặt cho bệnh nhân khác
                                Nếu bạn hủy lịch mà không thông báo cho BookingCare 2 lần liên tiếp, chúng tôi có thể cân nhắc
                                ngừng hỗ trợ đặt khám cho bạn vào lần tiếp theo.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(1)}>
                            Làm thế nào để đặt lịch khám trên BookingCare?
                        </h3>
                        {openQuestions[1] && (
                            <div className="detail-answer">
                                3 bước đặt khám trên BookingCare
                                <ul>
                                    <li>Bước 1. Bạn truy cập trang web http://bookingcare.vn hoặc tải ứng dụng (Apps)
                                        của BookingCare trên hệ điều hành Android và iOS</li>
                                    <li>Bước 2. Chọn bác sĩ hoặc cơ sở y tế phù hợp với nhu cầu khám chữa bệnh</li>
                                    <li>Bước 3. Điền thông tin theo mẫu và xác nhận đặt lịch</li>
                                </ul>
                                Trong trường hợp không lựa chọn được bác sĩ phù hợp, bạn có thể để lại lời nhắn trên mục "Hỗ trợ" trên BookingCare, chúng tôi sẽ gọi lại và hướng dẫn chu đáo.

                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(2)}>
                            Nếu nhập sai thông tin khi đặt lịch, BookingCare có thể giúp tôi được không?
                        </h3>
                        {openQuestions[2] && (
                            <div className="detail-answer">
                                Có. Bạn vui lòng để lại thông tin cho BookingCare trong phần "Hỗ trợ".
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(3)}>
                            Khi muốn thay đổi /hủy lịch khám, BookingCare có thể giúp tôi được không?
                        </h3>
                        {openQuestions[3] && (
                            <div className="detail-answer">
                                Có. Bạn vui lòng để lại thông tin cho BookingCare trong phần "Hỗ trợ".
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(4)}>
                            Nếu muốn khám bác sĩ khác tôi phải làm thế nào?
                        </h3>
                        {openQuestions[4] && (
                            <div className="detail-answer">
                                Bạn vui lòng chọn lại bác sĩ bạn muốn đặt khám trên hệ thống, sau đó làm thao tác đặt khám như lúc đầu.
                                Sau khi nhận được thông tin, BookingCare sẽ liên hệ lại cho bạn để xác nhận về việc thay đổi lịch.
                            </div>
                        )}
                    </div>

                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(5)}>
                            BookingCare có thể hướng dẫn đường đi đến bệnh viện/phòng khám giúp tôi được không?
                        </h3>
                        {openQuestions[5] && (
                            <div className="detail-answer">
                                BookingCare sẽ gửi cho bạn hướng dẫn đi khám sau khi bạn đặt khám.
                                Trong hướng dẫn này có phần hướng dẫn đường đi đến phòng khám và kèm với bản đồ.
                                Bạn có thể xem thêm để biết vị trí của phòng khám.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(6)}>
                            Nếu quên đi khám theo hẹn tôi nên làm thế nào?
                        </h3>
                        {openQuestions[6] && (
                            <div className="detail-answer">
                                Bạn vui lòng báo lại để BookingCare giúp bạn chuyển lịch khám vào ngày khác.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(7)}>
                            Tôi muốn hủy lịch khám thì làm như thế nào?
                        </h3>
                        {openQuestions[7] && (
                            <div className="detail-answer">
                                Để hủy lịch đã đặt, bạn vui lòng thực hiện theo các bước sau:
                                Bước 1: Tải App BookingCare về điện thoại theo đường dẫn https://bookingcare.vn/app
                                Bước 2: Đăng nhập App bằng số điện thoại bạn đã đăng ký lịch.
                                Bước 3: Trong mục Thông báo, bạn vào chọn phần Hướng dẫn đi khám, chọn Hủy.
                                Bước 4: Bạn chọn lý do hủy sau đó chọn xác nhận.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(8)}>
                            Tôi bận việc nên đến muộn khoảng 30 phút so với Giờ đã hẹn có được không?
                        </h3>
                        {openQuestions[8] && (
                            <div className="detail-answer">
                                Nếu bạn có việc và đến muộn hơn giờ đặt hẹn, bạn vui lòng báo cho BookingCare để
                                tránh ảnh hưởng đến quyền lợi của bạn khi bạn đến khám và để BookingCare sắp xếp
                                lịch hẹn cho các bệnh nhân khác.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(9)}>
                            Tôi đã đặt khám qua BookingCare, vậy tôi có được khám đúng theo giờ hẹn khám không?
                        </h3>
                        {openQuestions[9] && (
                            <div className="detail-answer">
                                Chúng tôi phối hợp với bác sĩ, cơ sở y tế để cố gắng hỗ trợ người bệnh được khám theo lịch đã hẹn trước.<br></br>

                                Đi khám bác sĩ là một hoạt động đặc thù mà thời gian khám thực tế có thể sai khác với lịch hẹn trước.
                                Việc này xuất phát từ nhiều nguyên nhân khác nhau như là quá tải ở bệnh viện, thời gian khám cho từng
                                bệnh nhân kéo dài hơn dự kiến, bác sĩ cần thêm hội chẩn chuyên môn và có cả sự sắp xếp chưa khoa học ở các cơ sở y tế.<br></br>

                                Tuy nhiên, chúng tôi luôn cố gắng cập nhật lịch khám bác sĩ theo
                                thời gian thực và tối ưu hóa qui trình để giảm thiểu thời gian chờ khám của bệnh nhân.
                                Ở một số bác sĩ hoặc cơ sở y tế trên BookingCare, bệnh nhân có thể chọn dịch vụ hẹn khám chính xác theo giờ đã hẹn.<br></br>

                                Thực tế, đặt khám qua BookingCare bạn sẽ được ưu tiên khám trước, giảm thiểu thời gian chờ và đi khám có kế hoạch.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(10)}>
                            Tôi đã đặt khám qua BookingCare, vậy có cần làm lại thủ tục khám khi đến bệnh viện/phòng khám không?
                        </h3>
                        {openQuestions[10] && (
                            <div className="detail-answer">
                                Bạn cần đến bộ phận tiếp đón tại nơi đến khám để kiểm tra thông tin một lần nữa trước khi vào khám với bác sĩ.
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(11)}>
                            Tôi muốn tải ứng dụng (Apps) của BookingCare thì phải làm thế nào?
                        </h3>
                        {openQuestions[11] && (
                            <div className="detail-answer">
                                Bạn vào App Store (iOS) hoặc Google Play Store (Android) để tải ứng dụng BookingCare.
                                <br></br>
                                Hoặc truy cập đường dẫn (link) sau đây trên điện thoại có kết nối mạng (internet) để tải về ứng dụng (Apps)
                                của BookingCare: https://bookingcare.vn/app
                            </div>
                        )}
                    </div>
                    <div className="faq">
                        <h3 onClick={() => this.toggleAnswerVisibility(12)}>
                            Cài ứng dụng BookingCare (Apps) rồi thì tôi vào đâu để đọc được thông tin Hướng dẫn đi khám?
                        </h3>
                        {openQuestions[12] && (
                            <div className="detail-answer">
                                Sau khi tải ứng dụng BookingCare (Apps),bạn sẽ nhận được Hướng dẫn đi khám
                                (HDĐK) 01 ngày trước hôm đi khám. Nếu bạn đặt lịch và đi khám ngay trong ngày,
                                Hướng dẫn đi khám sẽ được gửi ngay sau khi xác nhận đặt lịch. <br></br>

                                Bạn vào phần thông báo có biểu tượng hình cái chuông ở cuối màn hình để xem Hướng dẫn đi khám dành cho bạn.
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

export default connect(mapStateToProps, mapDispatchToProps)(AboutInsurance);
