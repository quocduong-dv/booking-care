import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import HomeFooter from '../../HomePage/HomeFooter';
import HomeHeader from '../../HomePage/HomeHeader';
import _, { get } from 'lodash';
import './DetailTermsofUse.scss';
class DetailTermsofUse extends Component {
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

            <div className="detail-terms-of-use-container">
                <HomeHeader />
                <div className="detail-terms-of-use-body">
                    <div className="detail-terms-of-use-description">
                        <div className="content-title">
                            <h1 className="baiviet-ten">Điều khoản sử dụng</h1>
                        </div>
                        <div className="baiviet-noidung py-2">
                            <p><strong>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN SỬ DỤNG</strong></p>
                            <p><strong>GIỚI THIỆU</strong></p>
                            <p>Chúng tôi, Công ty CP Công nghệ BookingCare, đơn vị sở hữu và vận hành “
                                <strong>Nền tảng Y tế Chăm sóc sức khỏe toàn diện BookingCare”</strong>
                                bao gồm hệ thống website và các ứng dụng di động. BookingCare cung cấp nền
                                tảng công nghệ để bệnh nhân thuận tiện trong việc đặt lịch dịch vụ y tế với
                                bác sĩ và cơ sở y tế. Bằng việc truy cập hoặc sử dụng dịch vụ của BookingCare,
                                bạn hoàn toàn đồng ý theo các điều khoản, điều kiện dưới đây.</p>
                            <p>Chúng tôi duy trì quyền thay đổi hoặc điều chỉnh bất kỳ điều khoản và điều kiện nào dưới đây.
                                Mọi sửa đổi nếu có sẽ có hiệu lực ngay lập tức sau khi đăng tải trên hệ thống trang này.</p>
                            <p><strong>SỬ DỤNG BOOKINGCARE</strong></p>
                            <p><strong>Thông tin người cung cấp dịch vụ “Khám chữa bệnh”</strong></p>
                            <p>Hệ thống BookingCare đăng tải thông tin và lịch khám của bác sỹ, dịch vụ y tế và cơ sở y tế.
                                Các thông tin về bác sĩ, dịch vụ y tế, cơ sở y tế (gọi chung là “Người cung cấp dịch vụ Khám chữa bệnh”)
                                được cung cấp bởi chính “Người cung cấp dịch vụ Khám chữa bệnh” và các nguồn thông tin tin cậy khác do
                                chúng tôi lựa chọn biên tập.</p>
                            <p>Chúng tôi cố gắng tìm hiểu và lựa chọn thông tin chính xác để đăng tải trên hệ thống.
                                Tuy nhiên, chúng tôi không đủ điều kiện xác minh sự chính xác tuyệt đối của thông tin đã đăng tải.</p>
                            <p><strong>Dịch vụ đặt lịch khám trực tuyến</strong></p>
                            <p>BookingCare cung cấp nền tảng công nghệ, phương tiện để kết nối bệnh nhân và bác sĩ,
                                cơ sở y tế. Qua đó cung cấp dịch vụ đặt lịch khám trực tuyến.</p>
                            <p>Bệnh nhân lựa chọn bác sĩ, dịch vụ hoặc cơ sở y tế phù hợp trên hệ thống BookingCare để đặt lịch khám.
                                BookingCare không phải là người cung cấp dịch vụ y tế và cũng không đại diện cho bất kỳ “Người cung
                                cấp dịch vụ khám chữa bệnh” nào. Vai trò duy nhất của chúng tôi là tạo ra các công cụ, phương tiện để cung cấp “
                                <strong>dịch vụ đặt lịch khám trực tuyến</strong>”.</p>
                            <p>Nhằm hỗ trợ việc đặt lịch khám hiệu quả cao, chúng tôi có thể kết
                                nối thêm với người có nhu cầu đặt lịch thông qua ứng dụng (Apps), tin nhắn SMS,
                                email, dịch vụ OTT và cuộc gọi thoại.</p>
                            <p><strong>Sai lệch thời gian &amp; hủy lịch khám</strong></p>
                            <p>Lịch hẹn khám qua hệ thống BookingCare và thời gian khám thực tế có thể
                                sai khác so với lịch hẹn ban đầu do đặc thù của hoạt động khám chữa bệnh.
                                Chúng tôi cố gắng để giảm thiểu sự sai lệch về thời gian và giảm thiểu thời gian chờ đợi của người bệnh.</p>
                            <p>Lịch hẹn khám có thể bị hủy hoặc thay đổi đột xuất vì một lý do nào đó,
                                ví dụ như bác sĩ có công việc đột xuất. Việc này vẫn thỉnh thoảng xảy ra,
                                nhất là với các bác sĩ, chuyên gia giỏi rất bận rộn. Chúng tôi sẽ thông báo
                                sự thay đổi đó trong thời gian sớm nhất bằng một hoặc đồng thời các ứng dụng tin nhắn SMS,
                                Push, email, dịch vụ OTT và cuộc gọi thoại.</p>
                            <p>Tuy nhiên, vì một lý do nào đó, chẳng hạn như lỗi đường truyền hoặc sai lệch thông tin,
                                bạn có thể không nhận được thông báo kịp thời. Trong trường hợp này, BookingCare mong nhận được
                                thông tin từ người bệnh để chúng tôi có thể sắp xếp lịch khám bổ sung phù hợp với yêu cầu của bạn.</p>
                            <p><strong>Phí dịch vụ đặt lịch</strong></p>
                            <p>Thời điểm hiện tại, BookingCare cung cấp dịch vụ đặt lịch khám trực tuyến
                                <strong>hoàn toàn miễn phí</strong>
                                đối với người bệnh khi đặt lịch khám thông qua BookingCare.</p>
                            <p>Trong một số trường hợp, bệnh nhân còn nhận được ưu đãi chi phí khám chữa bệnh khi đặt qua hệ thống.</p>
                            <p><strong>Chính sách hoàn trả chi phí dịch vụ "Bác sĩ từ xa"</strong></p>
                            <p>1. Trường hợp bác sĩ từ chối nhận khám (tình trạng bệnh không phù hợp khám từ xa/ không đúng chuyên môn của bác sĩ):
                                Bệnh nhân được hoàn 100% chi phí.</p>
                            <p>2. Trường hợp bệnh nhân chủ động yêu cầu hủy lịch:</p>
                            <ul>
                                <li>Yêu cầu hủy lịch &lt; 1 giờ trước giờ hẹn: Phí hủy lịch là 50%</li>
                                <li>Yêu cầu hủy lịch &gt; 1 giờ trước giờ hẹn: bệnh nhân được hoàn 100% chi phí</li>
                            </ul>
                            <p>3. Chi phí sẽ được hoàn lại trong vòng 5 – 7 ngày (không tính thứ 7, Chủ Nhật)</p>
                            <p><strong>Trường hợp bệnh nhân Cấp cứu</strong></p>
                            <p>BookingCare <strong>KHÔNG</strong> phù hợp trong các trường hợp bệnh nhân cấp cứu. Nếu gặp trường hợp
                                khẩn cấp chúng tôi khuyên bạn (hoặc người thân) không nên sử dụng dịch vụ đặt lịch khám BookingCare.</p>
                            <p>Bạn nên gọi số cấp cứu y tế <strong>115</strong> hoặc đến cơ sở y tế gần nhất để được thăm khám.</p>
                            <p><strong>Quyền miễn trừ</strong></p>
                            <p>BookingCare cung cấp “dịch vụ đặt lịch khám”, chúng tôi
                                <strong>không cung cấp</strong> dịch vụ y tế và không đại diện cho bất kỳ “Người cung cấp dịch vụ khám chữa bệnh”.
                                Chúng tôi không chịu trách nhiệm về chất lượng, hiệu quả khám chữa bệnh, chi phí,
                                giá cả dịch vụ mà bạn nhận được từ “Người cung cấp dịch vụ khám chữa bệnh”.</p>
                            <p>Chúng tôi cũng không chịu trách nhiệm pháp lý liên quan đến hoạt động khám chữa bệnh của
                                “người cung cấp dịch vụ khám chữa bệnh”.</p>
                            <p><strong>Giới hạn trách nhiệm pháp lý</strong></p>
                            <p>Chúng tôi chịu trách nhiệm pháp lý về những gì không thể bị loại trừ theo quy định của pháp luật Việt Nam.</p>
                            <p>Những phát sinh (nếu có) liên quan tới việc sử dụng dịch vụ đặt lịch khám BookingCare sẽ được hỗ trợ như mục “
                                <strong>vai trò của BookingCare</strong>”.</p>
                            <p><strong>Vai trò của BookingCare</strong></p>
                            <p><strong>Hỗ trợ trước, trong và sau khi đi khám</strong></p>
                            <p>Trước khám</p>
                            <ul>
                                <li>Nhắc lịch khám, dặn dò chuẩn bị trước khám</li>
                                <li>Hướng dẫn đi lại, qui trình làm thủ tục khám</li>
                            </ul>
                            <p>Trong khi khám</p>
                            <ul>
                                <li>Hỗ trợ giải quyết các vướng mắc trong khi khám</li>
                                <li>Hỗ trợ người bệnh những yêu cầu nảy sinh</li>
                            </ul>
                            <p>Sau khi khám</p>
                            <ul>
                                <li>Ghi nhận ý kiến của bệnh nhân sau khám</li>
                                <li>Hỗ trợ giải đáp, làm rõ những vấn đề chuyên môn (nếu có yêu cầu)</li>
                                <li>Hỗ trợ quyền lợi của bệnh nhân sau khi đi khám (nếu có yêu cầu)</li>
                            </ul>
                            <p><strong>Hỗ trợ khám lại miễn phí</strong></p>
                            <ul>
                                <li>Sau khi đi khám, nếu người bệnh không hài lòng với qui trình khám,
                                    tư vấn và phương án điều trị, BookingCare hỗ trợ bệnh nhân đi khám lại miễn phí với bác
                                    sĩ hoặc cơ sở y tế khác tương đương (khám chuyên khoa tương tự)</li>
                            </ul>
                            <p><strong>Hỗ trợ chăm sóc khách hàng</strong></p>
                            <p>Chúng tôi có đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ, làm rõ thông tin trước, trong
                                và sau khi khám qua BookingCare. Bộ phận này sẵn sàng kết nối với “Người cung</p>


                        </div>
                    </div>

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

export default connect(mapStateToProps, mapDispatchToProps)(DetailTermsofUse);
