import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import './Navigator.scss';

class MenuGroup extends Component {

    render() {
        const { name, children, onClick, isOpen } = this.props;
        return (
            <li className="menu-group">
                <div className="menu-group-name" onClick={onClick}>
                    <FormattedMessage id={name} />
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ float: 'right', fontSize: '10px' }}></i>
                </div>
                {isOpen && (
                    <ul className="menu-list list-unstyled">
                        {children}
                    </ul>
                )}
            </li>
        );
    }
}

class Menu extends Component {

    render() {
        const { name, active, link, children, onClick, hasSubMenu, onLinkClick, icon } = this.props;
        return (
            <li className={"menu" + (hasSubMenu ? " has-sub-menu" : "") + ("") + (active ? " active" : "")}>
                {hasSubMenu ? (
                    <Fragment>
                        <span
                            data-toggle="collapse"
                            className={"menu-link collapsed"}
                            onClick={onClick}
                            aria-expanded={"false"}
                        >
                            {icon && <i className={icon}></i>}
                            <FormattedMessage id={name} />
                            <div className="icon-right">
                                <i className={"far fa-angle-right"} />
                            </div>
                        </span>
                        <div>
                            <ul className="sub-menu-list list-unstyled">
                                {children}
                            </ul>
                        </div>
                    </Fragment>
                ) : (
                    <Link to={link} className="menu-link" onClick={onLinkClick}>
                        {icon && <i className={icon}></i>}
                        <FormattedMessage id={name} />
                    </Link>
                )}
            </li>
        );
    }
}

class SubMenu extends Component {

    getItemClass = path => {
        return this.props.location.pathname === path ? "active" : "";
    };

    render() {
        const { name, link, onLinkClick } = this.props;
        return (
            <li className={"sub-menu " + this.getItemClass(link)}>
                <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
                    <FormattedMessage id={name} />
                </Link>
            </li>
        );
    }
}

const MenuGroupWithRouter = withRouter(MenuGroup);
const MenuWithRouter = withRouter(Menu);
const SubMenuWithRouter = withRouter(SubMenu);

const withRouterInnerRef = (WrappedComponent) => {

    class InnerComponentWithRef extends React.Component {
        render() {
            const { forwardRef, ...rest } = this.props;
            return <WrappedComponent {...rest} ref={forwardRef} />;
        }
    }

    const ComponentWithRef = withRouter(InnerComponentWithRef, { withRef: true });

    return React.forwardRef((props, ref) => {
        return <ComponentWithRef {...props} forwardRef={ref} />;
    });
};

class Navigator extends Component {
    state = {
        expandedMenu: {},
        expandedGroups: {}
    };

    toggleGroup = (groupIndex) => {
        const { expandedGroups } = this.state;
        this.setState({
            expandedGroups: {
                ...expandedGroups,
                [groupIndex]: !expandedGroups[groupIndex]
            }
        });
    };

    toggle = (groupIndex, menuIndex) => {
        const expandedMenu = {};
        const needExpand = !(this.state.expandedMenu[groupIndex + '_' + menuIndex] === true);
        if (needExpand) {
            expandedMenu[groupIndex + '_' + menuIndex] = true;
        }

        this.setState({
            expandedMenu: expandedMenu
        });
    };

    isMenuHasSubMenuActive = (location, subMenus, link) => {
        if (subMenus) {
            if (subMenus.length === 0) {
                return false;
            }

            const currentPath = location.pathname;
            for (let i = 0; i < subMenus.length; i++) {
                const subMenu = subMenus[i];
                if (subMenu.link === currentPath) {
                    return true;
                }
            }
        }

        if (link) {
            return this.props.location.pathname === link;
        }

        return false;
    };

    checkActiveMenu = () => {
        const { menus, location } = this.props;
        outerLoop:
        for (let i = 0; i < menus.length; i++) {
            const group = menus[i];
            if (group.menus && group.menus.length > 0) {
                for (let j = 0; j < group.menus.length; j++) {
                    const menu = group.menus[j];
                    let isActive = false;
                    if (menu.subMenus && menu.subMenus.length > 0) {
                        if (this.isMenuHasSubMenuActive(location, menu.subMenus, null)) {
                            isActive = true;
                        }
                    } else if (location.pathname === menu.link) {
                        isActive = true;
                    }

                    if (isActive) {
                        const key = i + '_' + j;
                        this.setState({
                            expandedMenu: {
                                [key]: true
                            },
                            expandedGroups: {
                                ...this.state.expandedGroups,
                                [i]: true
                            }
                        });
                        break outerLoop;
                    }
                }
            }
        }
    };

    componentDidMount() {
        this.checkActiveMenu();
    };

    componentDidUpdate(prevProps, prevState) {
        const { location, menus } = this.props;
        const { location: prevLocation, menus: prevMenus } = prevProps;
        if (location !== prevLocation || menus !== prevMenus) {
            this.checkActiveMenu();
        };
    };

    render() {
        const { menus, location, onLinkClick } = this.props;
        return (
            <Fragment>
                <ul className="navigator-menu list-unstyled">
                    {
                        menus.map((group, groupIndex) => {
                            return (
                                <Fragment key={groupIndex}>
                                    <MenuGroupWithRouter
                                        name={group.name}
                                        onClick={() => this.toggleGroup(groupIndex)}
                                        isOpen={this.state.expandedGroups[groupIndex]}
                                    >
                                        {group.menus ? (
                                            group.menus.map((menu, menuIndex) => {
                                                const isMenuHasSubMenuActive = this.isMenuHasSubMenuActive(location, menu.subMenus, menu.link);
                                                const isSubMenuOpen = this.state.expandedMenu[groupIndex + '_' + menuIndex] === true;
                                                return (
                                                    <MenuWithRouter
                                                        key={menuIndex}
                                                        active={isMenuHasSubMenuActive}
                                                        name={menu.name}
                                                        link={menu.link}
                                                        icon={menu.icon}
                                                        hasSubMenu={menu.subMenus}
                                                        isOpen={isSubMenuOpen}
                                                        onClick={() => this.toggle(groupIndex, menuIndex)}
                                                        onLinkClick={onLinkClick}
                                                    >
                                                        {menu.subMenus && menu.subMenus.map((subMenu, subMenuIndex) => (
                                                            <SubMenuWithRouter
                                                                key={subMenuIndex}
                                                                name={subMenu.name}
                                                                link={subMenu.link}
                                                                onClick={this.closeOtherExpand}
                                                                onLinkClick={onLinkClick}
                                                            />
                                                        ))}
                                                    </MenuWithRouter>
                                                );
                                            })
                                        ) : null}
                                    </MenuGroupWithRouter>
                                </Fragment>
                            );
                        })
                    }
                </ul>
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default withRouterInnerRef(connect(mapStateToProps, mapDispatchToProps)(Navigator));
