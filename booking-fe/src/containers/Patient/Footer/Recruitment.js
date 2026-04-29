import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import './DetailFooter.scss';

class Recruitment extends Component {
    render() {
        return (
            <div className="detail-privacy-policy-container">
                <HomeHeader />
                <div className="detail-privacy-policy-body">
                    <div className="detail-privacy-policy-description">
                        <div className="content-title">
                            <h1 className="baiviet-ten">Tuyển dụng tại BookingCare</h1>
                        </div>
                        <div className="baiviet-noidung py-2">
                            <h2>1. Về chúng tôi</h2>
                            <p>
                                BookingCare là nền tảng đặt lịch khám bệnh trực tuyến hàng đầu Việt Nam,
                                kết nối người dùng với hơn 1.000 bác sĩ và 200+ cơ sở y tế uy tín.
                                Chúng tôi đang tìm kiếm các đồng đội cùng xây dựng sản phẩm y tế số có ích cho cộng đồng.
                            </p>

                            <h2>2. Vị trí đang tuyển</h2>
                            <ul>
                                <li><strong>Fullstack Developer (ReactJS + Node.js)</strong> - TP.HCM - 2 vị trí</li>
                                <li><strong>Mobile Developer (React Native)</strong> - Ha Noi - 1 vi tri</li>
                                <li><strong>Product Designer (UX/UI)</strong> - TP.HCM - 1 vi tri</li>
                                <li><strong>Chăm sóc khách hàng (CSKH)</strong> - Ha Noi / TP.HCM - 3 vi tri</li>
                                <li><strong>Content Marketing</strong> - Remote - 2 vi tri</li>
                                <li><strong>QA Engineer</strong> - TP.HCM - 1 vi tri</li>
                            </ul>

                            <h2>3. Quyền lợi</h2>
                            <ul>
                                <li>Lương cạnh tranh, thưởng hiệu suất theo quý.</li>
                                <li>Bảo hiểm sức khỏe mở rộng cho bản thân và người thân.</li>
                                <li>13 tháng lương + Performance Bonus.</li>
                                <li>Team building, du lịch công ty 1-2 lần/năm.</li>
                                <li>Môi trường trẻ, học hỏi liên tục, review 6 tháng/lần.</li>
                                <li>Macbook hoặc thiết bị tương đương cho vị trí kỹ thuật.</li>
                            </ul>

                            <h2>4. Cách ứng tuyển</h2>
                            <p>
                                Gửi CV kèm portfolio (nếu có) về email:{' '}
                                <a href="mailto:tuyendung@bookingcare.vn">tuyendung@bookingcare.vn</a>{' '}
                                với tiêu đề: <em>[Ứng tuyển] - [Vị trí] - [Họ và tên]</em>.
                            </p>
                            <p>Mọi câu hỏi xin liên hệ Hotline HR: <a href="tel:0982571448">098-2571-448</a> (giờ hành chính).</p>

                            <h2>5. Quy trình phỏng vấn</h2>
                            <ol>
                                <li>Sàng lọc hồ sơ (2-3 ngày làm việc).</li>
                                <li>Phỏng vấn vòng 1: HR + Team Lead.</li>
                                <li>Bài test kỹ năng (với vị trí kỹ thuật).</li>
                                <li>Phỏng vấn vòng 2: BOD / Giám đốc sản phẩm.</li>
                                <li>Offer và onboarding trong vòng 5 ngày làm việc.</li>
                            </ol>

                            <p>Chúng tôi rất mong được đồng hành cùng bạn tại BookingCare!</p>
                        </div>
                    </div>
                </div>
                <div className="end-handbook"><HomeFooter /></div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ language: state.app.language });
export default connect(mapStateToProps)(Recruitment);
