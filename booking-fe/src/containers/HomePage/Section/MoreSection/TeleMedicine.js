import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { getAllSpecialty } from '../../../../services/userService';
import { withRouter } from 'react-router';
import HomeHeader from '../../HomeHeader';
import HomeFooter from '../../HomeFooter';
import { path } from '../../../../utils/constant';
import './TeleMedicine.scss';

class TeleMedicine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        }
    }

    async componentDidMount() {
        let res = await getAllSpecialty('remote');
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data
            })
        }
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {
            // Có thể reload data nếu cần
        }
    }

    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`)
        }
    }

    returnToHome = () => {
        if (this.props.history) {
            this.props.history.push(path.HOMEPAGE)
        }
    }

    render() {
        let { dataSpecialty } = this.state;

        return (
            <div className="more-special-container">
                <HomeHeader isShowBanner={false} />

                <div className="more-special-content">
                    <div className="more-special-header">
                        <div className="breadcrumb">
                            <i className="fas fa-home" onClick={() => this.returnToHome()}></i>
                            <span> / Khám từ xa</span>
                        </div>
                    </div>

                    <div className="more-special-grid">
                        {dataSpecialty && dataSpecialty.length > 0 &&
                            dataSpecialty.map((item, index) => {
                                return (
                                    <div
                                        className="specialty-grid-item"
                                        key={index}
                                        onClick={() => this.handleViewDetailSpecialty(item)}
                                    >
                                        <div className="specialty-image-wrapper">
                                            <div className="circle-border">
                                                <div
                                                    className="specialty-image"
                                                    style={{ backgroundImage: `url(${item.image})` }}
                                                />
                                            </div>
                                            <div className="smartphone-icon">
                                                <i className="fas fa-mobile-alt"></i>
                                            </div>
                                        </div>
                                        <div className="specialty-name">{item.name}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeleMedicine));
