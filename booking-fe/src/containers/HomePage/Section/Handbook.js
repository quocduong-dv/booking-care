import React, { Component } from 'react';

import { connect } from 'react-redux';

import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
// Import css files
import { getAllHandBook } from '../../../services/userService';
import { withRouter } from 'react-router';
import './Handbook.scss';

class Handbook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataHandbook: []
        }
    }
    async componentDidMount() {
        let res = await getAllHandBook();
        if (res && res.errCode === 0) {
            this.setState({
                dataHandbook: res.data
            })
        }
    }
    handleViewDetailHandbook = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-handbook/${item.id}`)
        }
    }
    handleViewMore = () => {
        if (this.props.history) this.props.history.push('/handbook');
    }
    render() {

        let { dataHandbook } = this.state;
        return (
            <div className="section-share section-handbook">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section"><FormattedMessage id="homepage.hand-book" /></span>
                        <button className="btn-section" onClick={this.handleViewMore}> <FormattedMessage id="homepage.more-info" /></button>
                    </div>
                    <div className="section-body">
                        <Slider {...this.props.settings}>
                            {dataHandbook && dataHandbook.length > 0 &&
                                dataHandbook.map((item, index) => {
                                    return (
                                        <div className="section-customize handbook-child"
                                            key={index}
                                            onClick={() => this.handleViewDetailHandbook(item)}
                                        >
                                            <div className="bg-image section-handbook"
                                                style={{ backgroundImage: `url(${item.image})` }}
                                            />
                                            <div className="handbook-name">{item.name}</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Handbook));
