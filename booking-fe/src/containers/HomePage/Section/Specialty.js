import React, { Component } from 'react';

import { connect } from 'react-redux';
import './Specialty.scss';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
import { LANGUAGES } from '../../../utils';
// Import css files

import specialtyImg from "../../../assets/specialty/coxuong.jpg";
import { getAllSpecialty } from '../../../services/userService';
import { withRouter } from 'react-router';
import HomeFooter from '../HomeFooter';
class Specialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSpecialty: []
        }
    }
    async componentDidMount() {
        let res = await getAllSpecialty('clinic');
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data
            })
        }
    }
    handleViewDetailSpecialty = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`)
        }
    }
    handleViewMore = () => {
        if (this.props.history) this.props.history.push('/more-specialty');
    }
    render() {

        let { dataSpecialty } = this.state;
        return (
            <div className="section-share section-specialty">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section"> <FormattedMessage id="homepage.popular-specialties" /></span>
                        <button className="btn-section" onClick={this.handleViewMore}> <FormattedMessage id="homepage.more-info" /></button>
                    </div>

                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            {dataSpecialty && dataSpecialty.length > 0 &&
                                dataSpecialty.map((item, index) => {
                                    return (
                                        <div className="section-customize specialty-child"
                                            key={index}
                                            onClick={() => this.handleViewDetailSpecialty(item)}
                                        >
                                            <div className="bg-image section-specialty"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            />
                                            <div className="specialty-name">{item.name}</div>

                                        </div>

                                    )
                                })
                            }


                        </Slider>

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Specialty));
