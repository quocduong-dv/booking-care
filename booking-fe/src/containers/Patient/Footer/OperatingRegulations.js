import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import './DetailFooter.scss';

class OperatingRegulations extends Component {
    render() {
        return (
            <div className="detail-privacy-policy-container">
                <HomeHeader />
                <div className="detail-privacy-policy-body">
                    <div className="detail-privacy-policy-description">
                        <div className="content-title">
                            <h1 className="baiviet-ten">Quy chế hoạt động sàn BookingCare</h1>
                        </div>
                        <div className="baiviet-noidung py-2">
                            <h2>Điều 1. Phạm vi điều chỉnh</h2>
                            <p>
                                Quy chế này điều chỉnh hoạt động của Sàn giao dịch thương mại điện tử BookingCare
                                (sau đây gọi là "Sàn") do Công ty Cổ phần Công nghệ BookingCare ("Công ty") sở hữu và vận hành.
                                Quy chế được áp dụng cho tất cả thành viên, bao gồm người dùng cá nhân, bác sĩ và cơ sở y tế
                                tham gia cung cấp dịch vụ trên Sàn.
                            </p>

                            <h2>Điều 2. Giải thích từ ngữ</h2>
                            <ul>
                                <li><strong>Sàn:</strong> Website bookingcare.vn và các ứng dụng di động của BookingCare.</li>
                                <li><strong>Thành viên:</strong> Cá nhân, tổ chức đăng ký tài khoản sử dụng dịch vụ trên Sàn.</li>
                                <li><strong>Nhà cung cấp dịch vụ:</strong> Bác sĩ, phòng khám, bệnh viện đăng ký cung cấp dịch vụ y tế qua Sàn.</li>
                                <li><strong>Dịch vụ:</strong> Các dịch vụ đặt khám, tư vấn sức khỏe, bán đơn thuốc được giới thiệu trên Sàn.</li>
                            </ul>

                            <h2>Điều 3. Quy định về thành viên</h2>
                            <p>Thành viên tham gia Sàn phải đáp ứng các điều kiện sau:</p>
                            <ul>
                                <li>Từ đủ 18 tuổi trở lên và có đầy đủ năng lực hành vi dân sự.</li>
                                <li>Cung cấp thông tin đăng ký chính xác, trung thực và cập nhật khi có thay đổi.</li>
                                <li>Tự chịu trách nhiệm bảo mật tài khoản và mật khẩu đã được cấp.</li>
                                <li>Không sử dụng Sàn vào các mục đích vi phạm pháp luật hoặc đạo đức xã hội.</li>
                            </ul>

                            <h2>Điều 4. Quy trình đặt lịch khám</h2>
                            <ol>
                                <li>Thành viên lựa chọn bác sĩ / chuyên khoa / cơ sở y tế phù hợp trên Sàn.</li>
                                <li>Chọn khung giờ còn trống và điền đầy đủ thông tin đặt khám.</li>
                                <li>Thanh toán qua VNPay hoặc chọn thanh toán trực tiếp tại cơ sở y tế.</li>
                                <li>Nhận email xác nhận và mã đặt lịch. Vui lòng xác nhận đúng thông tin trước khi đến khám.</li>
                                <li>Trước 30 phút khám, thành viên có mặt tại cơ sở y tế và xuất trình mã đặt lịch.</li>
                            </ol>

                            <h2>Điều 5. Quyền và nghĩa vụ của Công ty</h2>
                            <ul>
                                <li>Đảm bảo Sàn hoạt động ổn định, an toàn 24/7 (trừ thời gian bảo trì đã thông báo).</li>
                                <li>Bảo mật thông tin thành viên theo Chính sách bảo mật đã công bố.</li>
                                <li>Có quyền từ chối, tạm ngừng hoặc chấm dứt dịch vụ với thành viên vi phạm Quy chế.</li>
                                <li>Hỗ trợ thành viên giải quyết khiếu nại trong thời hạn 07 ngày làm việc.</li>
                            </ul>

                            <h2>Điều 6. Quyền và nghĩa vụ của thành viên</h2>
                            <ul>
                                <li>Được sử dụng đầy đủ các dịch vụ trên Sàn theo gói đã đăng ký / thanh toán.</li>
                                <li>Được bảo mật thông tin cá nhân, y bạ theo quy định pháp luật.</li>
                                <li>Có trách nhiệm thanh toán đầy đủ phí dịch vụ theo báo giá công khai trên Sàn.</li>
                                <li>Chịu trách nhiệm về tính chính xác của thông tin khi đặt lịch khám.</li>
                            </ul>

                            <h2>Điều 7. Phí dịch vụ và thanh toán</h2>
                            <p>
                                Phí dịch vụ bao gồm: phí khám bệnh do cơ sở y tế quy định, không bao gồm phí xét nghiệm,
                                chẩn đoán hình ảnh phát sinh. Thanh toán qua VNPay được bảo mật theo chuẩn PCI-DSS.
                                Trường hợp huỷ lịch trước 24 giờ, khoản thanh toán sẽ được hoàn lại trong vòng 3-7 ngày làm việc.
                            </p>

                            <h2>Điều 8. Xử lý tranh chấp</h2>
                            <p>
                                Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải.
                                Trường hợp không đạt được thỏa thuận, các bên có quyền đưa vụ việc ra Tòa án có thẩm quyền tại Việt Nam
                                để giải quyết theo pháp luật hiện hành.
                            </p>

                            <h2>Điều 9. Điều khoản thi hành</h2>
                            <p>
                                Quy chế này có hiệu lực kể từ ngày ký ban hành và được công bố công khai trên Sàn.
                                Công ty có quyền sửa đổi, bổ sung Quy chế và sẽ thông báo cho thành viên qua email hoặc
                                thông báo trên Sàn trước ít nhất 7 ngày trước khi áp dụng.
                            </p>

                            <p><em>Mọi thắc mắc xin liên hệ: <a href="mailto:support@bookingcare.vn">support@bookingcare.vn</a> - Hotline: <a href="tel:0982571448">098-2571-448</a>.</em></p>
                        </div>
                    </div>
                </div>
                <div className="end-handbook"><HomeFooter /></div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ language: state.app.language });
export default connect(mapStateToProps)(OperatingRegulations);
