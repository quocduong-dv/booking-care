import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as actions from "../../../store/actions";
import Navigator from '../../../components/Navigator';
import { adminMenu, doctorMenu } from '../../Header/menuApp';
import { getExtraInforDoctorById } from '../../../services/userService';
import './Sidebar.scss';
import { USER_ROLE } from "../../../utils";
import _ from 'lodash';

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuApp: [],
            isCollapsed: false,
            specialtyName: ''
        }
    }

    async componentDidMount() {
        let { userInfo } = this.props;
        let menu = [];

        if (userInfo && !_.isEmpty(userInfo)) {
            let role = userInfo.roleId;
            if (role === USER_ROLE.ADMIN) {
                menu = adminMenu;
            }
            if (role === USER_ROLE.DOCTOR) {
                menu = doctorMenu;
                this.loadDoctorSpecialty(userInfo.id);
            }
        }
        this.setState({ menuApp: menu });
    }

    loadDoctorSpecialty = async (doctorId) => {
        try {
            const res = await getExtraInforDoctorById(doctorId);
            if (res && res.errCode === 0 && res.data) {
                const specialty = res.data.specialtyData?.name
                    || res.data.nameClinic
                    || '';
                this.setState({ specialtyName: specialty });
            }
        } catch (e) { /* ignore */ }
    }

    toggleSidebar = () => {
        this.setState({
            isCollapsed: !this.state.isCollapsed
        }, () => {
            if (this.state.isCollapsed) {
                document.body.classList.add('sidebar-collapsed');
            } else {
                document.body.classList.remove('sidebar-collapsed');
            }
        });
    }

    render() {
        const { isCollapsed } = this.state;

        return (
            <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <i className="fas fa-hospital-alt"></i>
                        <span className="logo-text">BookingCare</span>
                    </div>
                    <button
                        type="button"
                        className="btn-toggle"
                        onClick={this.toggleSidebar}
                        aria-label={isCollapsed ? 'Mo rong thanh menu' : 'Thu gon thanh menu'}
                        aria-expanded={!isCollapsed}
                    >
                        <i className={`fas fa-bars`} aria-hidden="true"></i>
                    </button>
                </div>

                <div className="sidebar-menu">
                    <Navigator menus={this.state.menuApp} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
