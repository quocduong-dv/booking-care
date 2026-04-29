import React, { Component } from 'react';

import { connect } from 'react-redux';

import { FormattedMessage } from 'react-intl';



class About extends Component {

    render() {


        return (
            <div className="section-share section-about">
                <div className="section-about-header">
                    Truyền thông nói về Quốc Dương
                </div>
                <div className="section-about-content">
                    <div className="content-left">
                        <iframe width="100%" height="400px" src="https://www.youtube.com/embed/el8c0Yld6WA" title="BÁC SĨ ƠI TẠI SAO 2021 |
                         Trào ngược dạ dày thực quản | BSOTS - TẬP 14 FULL | 28/8/2021"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write;
                           encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>

                        </iframe>
                    </div>
                    <div className="content-right">
                        <p>1. chi tiết chuyên khoa<br></br>
                            2. chi tiết phòng khám, bệnh viện<br></br>
                            3. chi tiết bác sĩ<br></br>
                            4.chi tiết cẩm nang
                        </p>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(About);
