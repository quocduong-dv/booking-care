import React, { Component } from 'react';

import { connect } from 'react-redux';

import { FormattedMessage } from 'react-intl';
import LogoPhongKham from '../../assets/LogoPhongKham.svg';
import bocongthuong from '../../assets/icon/bocongthuong.svg'
import './HomeFooter.scss'
import { withRouter } from 'react-router';
import { Link } from "react-router-dom";
class HomeFooter extends Component {
    returnToHome = () => {
        if (this.props.history) {
            this.props.history.push(`/home`);
            // Đảm bảo rằng trang cuộn lên đầu
            window.scrollTo({
                top: 0,
                behavior: 'auto'  // hoặc 'smooth' nếu bạn muốn hiệu ứng cuộn mượt
            });
        }
    }

    render() {
        return (

            <div className="home-footer">

                <div className="container">
                    <div className="row">
                        {/* <!-- Left Footer Section --> */}
                        <div className="col-12 col-md-4 form-group left-footer">
                            <div className="home-left-footer">Công ty Cổ phần Công nghệ BookingCare</div>

                            <div className="home-icon-footer">
                                <div className="icon-footer">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="text-footer">
                                    <span>36/4 Đường 53, Khu phố 8, phường Hiệp Bình, Thủ Đức</span>
                                </div>
                            </div>

                            <div className="home-icon-footer">
                                <div className="icon-footer">
                                    <i className="fas fa-id-card"></i>
                                </div>
                                <div className="text-footer">
                                    ĐKKD số 0106790291. Sở KHĐT Hà Nội cấp ngày 16/03/2015
                                </div>
                            </div>

                            <div className="home-icon-footer">
                                <div className="icon-footer">
                                    <i className="fas fa-phone"></i>
                                </div>
                                <div className="text-footer">
                                    <a href="tel:0982571448">098-2571-448</a> (7h30 - 18h)
                                </div>
                            </div>

                            <div className="home-icon-footer">
                                <div className="icon-footer">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="text-footer">
                                    <a href="mailto:tranquocduong2872003@gmail.com">tranquocduong2872003@gmail.com</a> (7h30 - 18h)
                                </div>
                            </div>

                            <div className="bottom-left-footer">
                                Văn phòng tại TP Hồ Chí Minh
                            </div>

                            <div className="home-icon-footer">
                                <div className="icon-footer">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="text-footer">
                                    Tòa nhà H3, 384 Hoàng Diệu, Phường 6, Quận 4, TP.HCM
                                </div>
                            </div>

                            <div className="home-icon-footer d-flex align-items-center">
                                <img className="header-logo-1" src={bocongthuong} alt="Logo" />
                                <img className="header-logo-1" src={bocongthuong} alt="Logo" />
                            </div>
                        </div>

                        {/* <!-- Center Footer Section --> */}
                        <div className="col-12 col-md-4 form-group center-footer-section">
                            <img className="header-logo" src={LogoPhongKham} alt="Logo" onClick={() => this.returnToHome()} />
                            <div className="center-footer">
                                <Link to="/recruitment">
                                    <span>Tuyển dụng</span>
                                </Link>
                            </div>
                            <div className="center-footer">

                                <Link to="/detail-footer">
                                    <span> Chính sách bảo mật</span>
                                </Link>
                            </div>
                            <div className="center-footer">

                                <Link to="/operating-regulations">
                                    <span>Quy chế hoạt động</span>
                                </Link>

                            </div>
                            <div className="center-footer">
                                <Link to="/detail-terms-of-use">
                                    <span>Điều khoản sử dụng</span>
                                </Link>
                            </div>
                            <div className="center-footer">
                                <Link to="/benh-nhan-thuong-hoi">
                                    <span>Câu hỏi thường gặp</span>
                                </Link>
                            </div>
                        </div>

                        {/* <!-- Right Footer Section --> */}
                        <div className="col-12 col-md-4 form-group">
                            <div className="right-footer-cnt">
                                Đối tác bảo trợ nội dung
                            </div>
                            <div className="sponsor-container">
                                <div className="right-footer-1 bg-image"></div>
                                <div className="sponsor-text">
                                    <h5 className="font-bold">Hello Doctor</h5>
                                    <p>Bảo trợ chuyên mục nội dung "sức khỏe tinh thần"</p>
                                </div>
                            </div>
                            <div className="sponsor-container">
                                <div className="right-footer-2 bg-image"></div>
                                <div className="sponsor-text">
                                    <h5 className="font-bold">Hệ thống y khoa chuyên sâu quốc tế Bernard</h5>
                                    <p>Bảo trợ chuyên mục nội dung "y khoa chuyên sâu"</p>
                                </div>
                            </div>
                            <div className="sponsor-container">
                                <div className="right-footer-3 bg-image"></div>
                                <div className="sponsor-text">
                                    <h5 className="font-bold">Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn</h5>
                                    <p>Bảo trợ chuyên mục nội dung "sức khỏe tổng quát"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Border Footer Section --> */}
                    <div className="border-footer">
                        <div className="text-br-footer">
                            <i className="fa fa-solid fa-mobile phone-icon"></i>
                            <span className="sp-text">Tải ứng dụng BookingCare cho điện thoại hoặc máy tính bảng:</span>
                            <span><a href=""> Android</a></span>
                            <span> - </span>
                            <span><a href=""> iPhone/iPad</a></span>
                            <span> - </span>
                            <span><a href="">Khác</a></span>
                        </div>
                    </div>

                </div>
                <div className='col-12 end-footer-end'>
                    <span className="text-end-ft">© 2024 BookingCare.</span>
                </div>
            </div >



        );

    }

}

const mapStateToProps = state => {
    return {
        // cài đặt ngôn ngữ
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeFooter));
