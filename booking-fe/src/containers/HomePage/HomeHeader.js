import React, { Component } from 'react';

import { connect } from 'react-redux';
import './HomeHeader.scss';
import LogoPhongKham from '../../assets/LogoPhongKham.svg';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES, path } from '../../utils';
import { changeLanguageApp, processLogout } from "../../store/actions";
import { withRouter } from 'react-router';
import NotificationBell from '../../components/NotificationBell/NotificationBell';
import { searchSuggestService } from '../../services/userService';
class HomeHeader extends Component {
    state = {
        showMenu: false,
        searchKeyword: '',
        suggestions: [],
        showSuggest: false,
        suggestLoading: false
    };

    searchDebounceTimer = null;
    searchReqId = 0;
    searchBoxRef = React.createRef();

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    }

    handleClickOutside = (e) => {
        if (this.searchBoxRef.current && !this.searchBoxRef.current.contains(e.target)) {
            this.setState({ showSuggest: false });
        }
    }

    handleSearchChange = (e) => {
        const v = e.target.value;
        this.setState({ searchKeyword: v, showSuggest: true });
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        const kw = v.trim();
        if (!kw) {
            this.setState({ suggestions: [], suggestLoading: false });
            return;
        }
        this.setState({ suggestLoading: true });
        this.searchDebounceTimer = setTimeout(() => this.fetchSuggest(kw), 250);
    }

    fetchSuggest = async (kw) => {
        const reqId = ++this.searchReqId;
        try {
            const res = await searchSuggestService(kw);
            if (reqId !== this.searchReqId) return; // stale
            const data = (res && res.errCode === 0 && Array.isArray(res.data)) ? res.data : [];
            this.setState({ suggestions: data, suggestLoading: false });
        } catch (err) {
            if (reqId !== this.searchReqId) return;
            this.setState({ suggestions: [], suggestLoading: false });
        }
    }

    handleSelectSuggest = (item) => {
        if (!this.props.history || !item) return;
        this.setState({ showSuggest: false, searchKeyword: item.name || '' });
        if (item.type === 'specialty') this.props.history.push(`/detail-specialty/${item.id}`);
        else if (item.type === 'clinic') this.props.history.push(`/detail-clinic/${item.id}`);
        else if (item.type === 'doctor') this.props.history.push(`/detail-doctor/${item.id}`);
    }

    renderSuggestGroups = () => {
        const groups = [
            { type: 'specialty', label: 'Chuyen khoa', icon: 'fas fa-stethoscope' },
            { type: 'doctor', label: 'Bac si', icon: 'fas fa-user-md' },
            { type: 'clinic', label: 'Phong kham', icon: 'fas fa-hospital' }
        ];
        return groups.map(g => {
            const items = this.state.suggestions.filter(s => s.type === g.type);
            if (!items.length) return null;
            return (
                <div className="suggest-group" key={g.type}>
                    <div className="suggest-group-label">{g.label}</div>
                    {items.map(it => (
                        <div className="suggest-item" key={`${g.type}-${it.id}`}
                            onMouseDown={(e) => { e.preventDefault(); this.handleSelectSuggest(it); }}>
                            <i className={g.icon} aria-hidden="true"></i>
                            <div className="suggest-text">
                                <div className="suggest-name">{it.name}</div>
                                {it.subtitle && <div className="suggest-sub">{it.subtitle}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        });
    }

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);

        // fire redux event: actions

    }
    returnToHome = () => {
        if (this.props.history) {
            this.props.history.push(`/home`)
        }
    }
    handleViewMoreSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(path.MORE_SPECIALTY)
        }
    }
    handleViewTelemedicine = () => {
        if (this.props.history) {
            this.props.history.push(path.TELEMEDICINE)
        }
    }
    handleLogin = () => {
        if (this.props.history) {
            this.props.history.push(path.LOGIN_CLIENT)
        }
    }
    toggleMenu = () => {
        this.setState(prev => ({ showMenu: !prev.showMenu }));
    }
    goHistory = () => {
        this.setState({ showMenu: false });
        if (this.props.history) this.props.history.push(path.PATIENT_HISTORY);
    }
    goProfile = () => {
        this.setState({ showMenu: false });
        if (this.props.history) this.props.history.push(path.PATIENT_PROFILE);
    }
    goPackages = () => {
        if (this.props.history) this.props.history.push(path.SERVICE_PACKAGES);
    }
    goSearchDoctors = () => {
        if (this.props.history) this.props.history.push(path.DOCTOR_SEARCH);
    }
    goHandbook = () => {
        if (this.props.history) this.props.history.push(path.HANDBOOK_LIST);
    }
    goLab = () => {
        this.setState({ showMenu: false });
        if (this.props.history) this.props.history.push(path.PATIENT_LAB);
    }
    goWaitlist = () => {
        this.setState({ showMenu: false });
        if (this.props.history) this.props.history.push(path.PATIENT_WAITLIST);
    }
    handleLogout = () => {
        this.setState({ showMenu: false });
        this.props.doLogout();
        if (this.props.history) this.props.history.push(path.HOMEPAGE);
    }
    render() {
        let language = this.props.language;// biến props lấy từ redux, còn langue lấy của dòng 105
        const { isLoggedIn, userInfo } = this.props;
        const { showMenu } = this.state;
        const isPatient = isLoggedIn && userInfo && userInfo.roleId === 'R3';

        return (

            <React.Fragment>
                <div className="home-header-container">
                    <div className="home-header-content">
                        <div className="left-content">
                            <img className="header-logo" src={LogoPhongKham} onClick={() => this.returnToHome()} />
                        </div>
                        <div className="center-content">
                            <div className="child-content" onClick={this.handleViewMoreSpecialty}>
                                <div><b><FormattedMessage id="homeheader.speciality" /></b></div>
                                <div className="subs-title"> <FormattedMessage id="homeheader.searchdoctor" /></div>
                            </div>
                            <div className="child-content" onClick={this.goSearchDoctors}>
                                <div><b>Tim bac si</b></div>
                                <div className="subs-title">Loc theo chuyen khoa, danh gia</div>
                            </div>
                            <div className="child-content" onClick={this.goPackages}>
                                <div><b>Goi kham</b></div>
                                <div className="subs-title">Uu dai - Tiet kiem</div>
                            </div>
                            <div className="child-content" onClick={this.goHandbook}>
                                <div><b>Cam nang</b></div>
                                <div className="subs-title">Bai viet y khoa</div>
                            </div>
                        </div>
                        <div className="right-content">
                            {isPatient ? (
                                <>
                                    <NotificationBell history={this.props.history} />
                                    <div className="user-menu-wrap">
                                    <div className="user-chip" onClick={this.toggleMenu}>
                                        <i className="fas fa-user-circle"></i>
                                        <span>{userInfo.firstName || userInfo.email}</span>
                                        <i className="fas fa-caret-down"></i>
                                    </div>
                                    {showMenu && (
                                        <div className="user-dropdown">
                                            <div className="item" onClick={this.goProfile}>
                                                <i className="fas fa-user"></i> Ho so & diem thuong
                                            </div>
                                            <div className="item" onClick={this.goHistory}>
                                                <i className="fas fa-history"></i> Lich su kham
                                            </div>
                                            <div className="item" onClick={this.goLab}>
                                                <i className="fas fa-flask"></i> Ket qua xet nghiem
                                            </div>
                                            <div className="item" onClick={this.goWaitlist}>
                                                <i className="fas fa-user-clock"></i> Danh sach cho
                                            </div>
                                            <div className="item" onClick={this.handleLogout}>
                                                <i className="fas fa-sign-out-alt"></i> Dang xuat
                                            </div>
                                        </div>
                                    )}
                                </div>
                                </>
                            ) : (
                                <div className='login-btn ' onClick={() => this.handleLogin()}>
                                    <FormattedMessage id="homeheader.login-client" />
                                </div>
                            )}
                            <div className="support"><i className="fas fa-question-circle"></i><FormattedMessage id="homeheader.support" /></div>
                            {/* LANGUAGES.VI ? ' :nếu  ap-> VN->run class language-vi active' or ngược lại  run language */}
                            <div className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'}><span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span></div>
                            <div className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'} ><span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span></div>
                        </div>
                    </div>
                </div>
                {this.props.isShowBanner === true &&
                    <div className="home-header-banner">
                        <div className="content-up">
                            <div className="title1"><FormattedMessage id="banner.title1" /></div>
                            <div className="title2"><FormattedMessage id="banner.title2" /></div>
                            <div className="search" ref={this.searchBoxRef}>
                                <i className="fa fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Tìm chuyên khoa, bác sĩ, phòng khám..."
                                    value={this.state.searchKeyword}
                                    onChange={this.handleSearchChange}
                                    onFocus={() => this.setState({ showSuggest: true })}
                                />
                                {this.state.showSuggest && this.state.searchKeyword.trim() && (
                                    <div className="suggest-dropdown">
                                        {this.state.suggestLoading && (
                                            <div className="suggest-empty">Dang tim...</div>
                                        )}
                                        {!this.state.suggestLoading && this.state.suggestions.length === 0 && (
                                            <div className="suggest-empty">Khong co ket qua phu hop</div>
                                        )}
                                        {!this.state.suggestLoading && this.renderSuggestGroups()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="content-down">
                            <div className="options">
                                <div className="option-child" onClick={() => this.handleViewMoreSpecialty()}>
                                    <div className="icon-child"><i className="far fa-hospital"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child1" /></div>
                                </div>
                                <div className="option-child" onClick={() => this.handleViewTelemedicine()}>
                                    <div className="icon-child"><i className="fas fa-mobile-alt"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child2" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-procedures"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child3" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-flask"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child4" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-user-md"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child5" /></div>
                                </div>
                                <div className="option-child">
                                    <div className="icon-child"><i className="fas fa-briefcase-medical"></i></div>
                                    <div className="text-child"><FormattedMessage id="banner.child6" /></div>
                                </div>

                            </div>
                        </div>
                    </div>
                }

            </React.Fragment>
        );
    }

}

const mapStateToProps = state => {
    return {
        // cài đặt ngôn ngữ
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
        doLogout: () => dispatch(processLogout())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));
