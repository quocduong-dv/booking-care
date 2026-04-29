import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import HomeHeader from '../../HomePage/HomeHeader';
import DoctorSchedule from '../Doctor/DoctorSchedule';
import DoctorExtraInfor from '../Doctor/DoctorExtraInfor';
import ProfileDoctor from '../Doctor/ProfileDoctor';
import { getDetailHandBookById, getAllCodeService } from '../../../services/userService';
import _, { get } from 'lodash';
import { LANGUAGES } from '../../../utils';
import HomeFooter from '../../HomePage/HomeFooter';
import './DetailFooter.scss';
class DetailFooter extends Component {
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
    // handleViewDetailFooter = (item) => {
    //     if (this.props.history) {
    //         this.props.history.push(`/detail-footer`)
    //     }
    // }
    render() {

        return (

            <div className="detail-privacy-policy-container">
                <HomeHeader />
                <div className="detail-privacy-policy-body">
                    <div className="detail-privacy-policy-description">
                        <div className="content-title">
                            <h1 className="baiviet-ten">Chính sách bảo mật</h1>
                        </div>
                        <div className="baiviet-noidung py-2">
                            <h2> 1. Mục đích và phạm vi thu thập</h2>
                            <p>Việc thu thập dữ liệu chủ yếu trên Sàn giao dịch TMĐT Bookingcare.vn
                                bao gồm: email, điện thoại, tên đăng nhập, mật khẩu đăng nhập, địa chỉ khách hàng (thành viên).
                                Đây là các thông tin mà Bookingcare.vn cần thành viên cung cấp bắt buộc khi đăng ký sử dụng dịch vụ và
                                để Bookingcare.vn liên hệ xác nhận khi khách hàng đăng ký sử dụng dịch vụ trên Website nhằm đảm bảo quyền lợi
                                cho cho người tiêu dùng.&nbsp;</p><p>Các thành viên sẽ tự chịu trách nhiệm về bảo mật và lưu giữ mọi hoạt động
                                    sử dụng dịch vụ dưới tên đăng ký, mật khẩu và hộp thư điện tử của mình. Ngoài ra, thành viên có trách nhiệm thông
                                    báo kịp thời cho Sàn giao dịch TMĐT Bookingcare.vn về những hành vi sử dụng trái phép, lạm dụng, vi phạm bảo mật,
                                    lưu giữ tên đăng ký và mật khẩu của bên thứ ba để có biện pháp giải quyết phù hợp.&nbsp;</p>
                            <h2>2. Phạm vi sử dụng thông tin</h2>
                            <p>Sàn giao dịch TMĐT Bookingcare.vn sử dụng thông tin thành viên cung cấp để:</p>
                            <ul><li>Cung cấp các dịch vụ đến Thành viên;</li>
                                <li>Gửi các thông báo về các hoạt động trao đổi thông tin giữa thành viên và Sàn giao dịch TMĐT Bookingcare.vn;</li>
                                <li>Ngăn ngừa các hoạt động phá hủy tài khoản người dùng của thành viên hoặc các hoạt động giả mạo Thành viên;</li>
                                <li>Liên lạc và giải quyết với thành viên trong những trường hợp đặc biệt.</li>
                                <li>Trong trường hợp có yêu cầu của pháp luật: Sàn giao dịch TMĐT Bookingcare.vn
                                    có trách nhiệm hợp tác cung cấp thông tin cá nhân thành viên khi
                                    có yêu cầu từ cơ quan tư pháp bao gồm: Viện kiểm sát, tòa án, cơ quan công an điều tra
                                    liên quan đến hành vi vi phạm pháp luật nào đó của khách hàng. Ngoài ra, không ai có quyền
                                    xâm phạm vào thông tin cá nhân của thành viên.</li></ul><h2>3. Thời gian lưu trữ thông tin</h2>
                            <p>Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến khi có yêu cầu hủy bỏ hoặc tự thành
                                viên đăng nhập và thực hiện hủy bỏ. Còn lại trong mọi trường hợp thông tin cá nhân thành viên
                                sẽ được bảo mật trên máy chủ của Bookingcare.vn.</p><h2>4. Những người hoặc tổ chức có thể được
                                    tiếp cận với thông tin cá nhân:</h2><p>Đối tượng được tiếp cận với thông tin cá nhân của khách
                                        hàng/ thành viên thuộc một trong những trường hợp sau:</p><ul><li>Công Ty Cổ Phần Công Nghệ Bookingcare</li>
                                <li>Các đối tác có ký hợp động thực hiện 1 phần dịch vụ do Công Ty Cổ Phần Công Nghệ Bookingcare.vn cung cấp.
                                    Các đối tác này sẽ nhận được những thông tin theo thỏa thuận hợp đồng (có thể 1 phần hoặc toàn bộ thông tin
                                    tùy theo điều khoản hợp đồng) để tiến hành hỗ trợ người dùng sử dụng dịch vụ do Công ty cung cấp.</li>
                                <li>Cơ quan nhà nước khi có yêu cầu Công ty cung cấp thông tin người dùng để phục vụ quá trình điều tra.</li>
                                <li>Người mua và Đối tác CSYT xảy ra tranh chấp và yêu cầu Công ty là đơn vị hòa giải.</li></ul>
                            <h2>5. Địa chỉ của đơn vị thu thập và quản lý thông tin cá nhân</h2>
                            <ul><li>Công Ty Cổ Phần Công Nghệ Bookingcare</li>
                                <li>Địa chỉ: Lô B4/D21, Khu đô thị mới Cầu Giấy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam</li>
                                <li>Hotline: 02473.012.468</li><li>Email: support@bookingcare.vn</li></ul>
                            <h2>6. Phương tiện và công cụ để người dùng tiếp cận và chỉnh sửa dữ liệu cá nhân của mình.</h2>
                            <p>Thành viên có quyền tự kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân
                                của mình bằng cách đăng nhập vào tài khoản và chỉnh sửa thông tin cá
                                nhân hoặc yêu cầu Bookingcare.vn thực hiện việc này.</p><p>Thành viên có quyền gửi
                                    khiếu nại về việc lộ thông tin các nhân cho bên thứ 3 đến Ban quản trị của Sàn giao
                                    dịch thương mại điện tử Bookingcare.vn. Khi tiếp nhận những phản hồi này, Bookingcare.vn
                                    sẽ xác nhận lại thông tin, phải có trách nhiệm trả lời lý do và hướng dẫn thành viên khôi
                                    phục và bảo mật lại thông tin.</p><p>Email: support@Bookingcare.vn</p>
                            <h2>7. Cam kết bảo mật thông tin cá nhân khách hàng</h2>
                            <p>Thông tin cá nhân của thành viên trên Bookingcare.vn được Bookingcare.vn
                                cam kết bảo mật tuyệt đối theo chính sách bảo vệ thông tin cá nhân của Bookingcare.vn.
                                Việc thu thập và sử dụng thông tin của mỗi thành viên chỉ được thực hiện khi có sự đồng
                                ý của khách hàng đó trừ những trường hợp pháp luật có quy định khác.</p>
                            <p>Không sử dụng, không chuyển giao, cung cấp hay tiết lộ cho bên thứ 3
                                nào về thông tin cá nhân của thành viên khi không có sự cho phép đồng ý từ thành viên.</p>
                            <p>Trong trường hợp máy chủ lưu trữ thông tin bị hacker tấn công dẫn đến mất mát dữ liệu cá nhân
                                thành viên, Bookingcare.vn sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra
                                xử lý kịp thời và thông báo cho thành viên được biết.</p>
                            <p>Ban quản lý Bookingcare.vn không
                                chịu trách nhiệm cũng như không giải quyết mọi khiếu nại có liên quan đến quyền lợi của thành
                                viên đó nếu xét thấy tất cả thông tin cá nhân của thành viên đó cung cấp khi đăng ký ban đầu
                                là không chính xác.</p>
                            <h2>8. Cơ chế tiếp nhận và giải quyết khiếu nại liên quan đến việc
                                thông tin cá nhân khách hàng</h2>
                            <p>Khi khách hàng gửi thông tin cá nhân của khách hàng
                                cho chúng tôi, khách hàng đã đồng ý với các điều khoản mà chúng tôi đã nêu ở trên,
                                Bookingcare.vn cam kết bảo mật thông tin cá nhân của các khách hàng bằng mọi cách thức
                                có thể. Chúng tôi sử dụng các hệ thống mã hóa&nbsp; nhằm bảo vệ thông tin này không bị
                                truy lục, sử dụng hoặc tiết lộ ngoài ý muốn.</p>
                            <p>Bookingcare.vn cũng khuyến cáo các
                                khách hàng nên bảo mật các thông tin liên quan đến mật khẩu truy xuất của các khách
                                hàng và không nên chia sẻ với bất kỳ người nào khác.</p>
                            <p>Thành viên có quyền gửi khiếu nại về việc lộ thông tin cá nhân cho
                                bên thứ ba đến Ban quản trị của Sàn giao dịch thương mại điện tử Bookingcare.vn.
                                Khi tiếp nhận những phản hồi này, Bookingcare.vn sẽ xác nhận lại thông tin, phải
                                có trách nhiệm trả lời lý do và hướng dẫn thành viên khôi phục và bảo mật lại thông tin.
                                Địa chỉ Email liên hệ: support@Bookingcare.vn.vn</p>
                            <p>Bookingcare.vn có trách nhiệm thực
                                hiện các biện pháp kỹ thuật, nghiệp vụ để xác minh các nội dung được phản ánh.
                                Thời gian xứ lý phản ánh liên quan đến thông tin cá nhân khách hàng là 7 ngày.
                                Trong trường hợp có phản ánh của khách hàng về việc sử dụng thông tin trái với mục đích đã nêu,
                                Bookingcare.vn sẽ tiến hành giải quyết theo các bước sau:</p>
                            <p><strong>Bước 1</strong>: Khách hàng gửi thông tin phản hồi về việc thông tin
                                cá nhân thu thập trái với mục đích đã nêu.</p>
                            <p><strong>Bước 2</strong>: Bộ phận Chăm sóc Khách hàng của Bookingcare.vn tiếp nhận
                                và giải quyết với các bên có liên quan.</p>
                            <p><strong>Bước 3</strong>: Trong trường hợp vượt ra khỏi tầm kiểm soát của Bookingcare.vn,
                                chúng tôi sẽ đưa ra các cơ quan có thẩm quyền để yêu cầu giải quyết</p>
                            <div>&nbsp;

                            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailFooter);
