import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as actions from "../../../store/actions";
import { LANGUAGES } from "../../../utils";
import { onSocket, joinRooms } from "../../../services/socket";
import { getUnreadByDoctorService } from "../../../services/userService";
import NotificationBell from "../../../components/NotificationBell/NotificationBell";
import './AdminHeader.scss';

class AdminHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatUnread: 0
        };
        this.unsubs = [];
    }

    handleChangeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);
    }

    componentDidMount() {
        this.subscribeChat();
        this.initChatUnread();
    }

    componentWillUnmount() {
        this.unsubs.forEach(u => typeof u === 'function' && u());
        this.unsubs = [];
    }

    initChatUnread = async () => {
        const { userInfo } = this.props;
        if (!userInfo || userInfo.roleId !== 'R2' || !userInfo.id) return;
        joinRooms({ role: 'R2', userId: userInfo.id });
        try {
            const res = await getUnreadByDoctorService(userInfo.id);
            if (res && res.errCode === 0) {
                this.setState({ chatUnread: res.data?.total || 0 });
            }
        } catch (e) { /* ignore */ }
    }

    subscribeChat = () => {
        this.unsubs.push(onSocket('chat:new', (msg) => {
            const { userInfo } = this.props;
            if (!userInfo || userInfo.roleId !== 'R2') return;
            if (msg?.senderRole !== 'patient') return;
            if (window.location.pathname.indexOf('/system/doctor-chat') !== -1) return;
            this.setState(prev => ({ chatUnread: prev.chatUnread + 1 }));
        }));
    }

    goChat = () => {
        this.setState({ chatUnread: 0 });
        if (this.props.history) this.props.history.push('/system/doctor-chat');
        else window.location.href = '/system/doctor-chat';
    }

    render() {
        const { processLogout, language, userInfo } = this.props;
        const { chatUnread } = this.state;
        const isDoctor = userInfo && userInfo.roleId === 'R2';

        return (
            <div className="admin-header-container">
                <div className="admin-header-content">
                    <div className="languages">
                        <span
                            className={language === LANGUAGES.VI ? "language-vi active" : "language-vi"}
                            onClick={() => this.handleChangeLanguage(LANGUAGES.VI)}
                        >
                            VN
                        </span>
                        <span
                            className={language === LANGUAGES.EN ? "language-en active" : "language-en"}
                            onClick={() => this.handleChangeLanguage(LANGUAGES.EN)}
                        >
                            EN
                        </span>
                    </div>

                    {isDoctor && (
                        <div className="notification-wrapper">
                            <div className="bell chat-bell" onClick={this.goChat} title="Tin nhan">
                                <i className="fas fa-comments"></i>
                                {chatUnread > 0 && <span className="badge">{chatUnread > 99 ? '99+' : chatUnread}</span>}
                            </div>
                        </div>
                    )}

                    <NotificationBell history={this.props.history} />


                    <div className="user-info">
                        <span className="welcome">
                            <FormattedMessage id="homeheader.welcome" />
                            {userInfo && userInfo.firstName ? ` ${userInfo.lastName} ${userInfo.firstName}` : ''}
                        </span>
                        <div className="avatar">
                            <img src={userInfo && userInfo.image ? userInfo.image : "https://via.placeholder.com/150"} alt="Avatar" />
                        </div>
                    </div>
                    <div className="btn-logout" onClick={processLogout} title="Log out">
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
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
        changeLanguageAppRedux: (language) => dispatch(actions.changeLanguageApp(language))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminHeader);
