import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { onSocket } from '../../services/socket';
import {
    getNotificationsService,
    markNotificationReadService,
    markAllNotificationsReadService,
    deleteNotificationService
} from '../../services/userService';
import './NotificationBell.scss';

const ICON_BY_TYPE = {
    booking_new: 'fas fa-calendar-plus',
    booking_status: 'fas fa-calendar-check',
    booking_cancelled: 'fas fa-times-circle',
    payment_success: 'fas fa-credit-card',
    review_new: 'fas fa-star',
    appointment_reminder: 'fas fa-bell',
    medicine_low: 'fas fa-pills',
    default: 'fas fa-info-circle'
};

class NotificationBell extends Component {
    state = {
        items: [],
        unread: 0,
        open: false,
        loading: false
    };
    unsubs = [];

    componentDidMount() {
        this.load();
        this.unsubs.push(onSocket('notification:new', (payload) => {
            if (!payload || Number(payload.userId) !== Number(this.props.userInfo?.id)) {
                return;
            }
            this.setState(prev => ({
                items: [payload, ...prev.items].slice(0, 30),
                unread: prev.unread + 1
            }));
        }));
    }

    componentWillUnmount() {
        this.unsubs.forEach(u => typeof u === 'function' && u());
        this.unsubs = [];
    }

    load = async () => {
        if (!this.props.userInfo?.id) return;
        this.setState({ loading: true });
        try {
            const res = await getNotificationsService({ limit: 30 });
            if (res && res.errCode === 0) {
                this.setState({
                    items: res.data || [],
                    unread: res.unreadCount || 0,
                    loading: false
                });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    toggle = () => {
        this.setState(prev => ({ open: !prev.open }));
    };

    onItemClick = async (item) => {
        if (!item.isRead) {
            await markNotificationReadService(item.id);
            this.setState(prev => ({
                items: prev.items.map(x => x.id === item.id ? { ...x, isRead: true } : x),
                unread: Math.max(0, prev.unread - 1)
            }));
        }
        if (item.link) {
            this.setState({ open: false });
            if (this.props.history) this.props.history.push(item.link);
            else window.location.href = item.link;
        }
    };

    onMarkAll = async () => {
        await markAllNotificationsReadService();
        this.setState(prev => ({
            items: prev.items.map(x => ({ ...x, isRead: true })),
            unread: 0
        }));
    };

    onDelete = async (ev, item) => {
        ev.stopPropagation();
        await deleteNotificationService(item.id);
        this.setState(prev => ({
            items: prev.items.filter(x => x.id !== item.id),
            unread: !item.isRead ? Math.max(0, prev.unread - 1) : prev.unread
        }));
    };

    render() {
        const { items, unread, open, loading } = this.state;
        const dark = !!this.props.dark;
        return (
            <div className={`notif-bell-wrapper ${dark ? 'dark' : ''}`}>
                <div className="bell-btn" onClick={this.toggle} title="Thong bao">
                    <i className="fas fa-bell"></i>
                    {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
                </div>
                {open && (
                    <div className="notif-dropdown">
                        <div className="notif-dropdown-header">
                            <strong>Thong bao</strong>
                            {unread > 0 && (
                                <button className="btn-link" onClick={this.onMarkAll}>
                                    Danh dau da doc
                                </button>
                            )}
                        </div>
                        <div className="notif-dropdown-list">
                            {loading && <div className="empty">Dang tai...</div>}
                            {!loading && items.length === 0 && (
                                <div className="empty">Chua co thong bao</div>
                            )}
                            {items.map(n => (
                                <div
                                    key={n.id}
                                    className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
                                    onClick={() => this.onItemClick(n)}
                                >
                                    <div className="icon">
                                        <i className={ICON_BY_TYPE[n.type] || ICON_BY_TYPE.default} />
                                    </div>
                                    <div className="body">
                                        <div className="title">{n.title || n.type}</div>
                                        {n.body && <div className="msg">{n.body}</div>}
                                        <div className="time">
                                            {n.createdAt ? moment(n.createdAt).fromNow() : ''}
                                        </div>
                                    </div>
                                    <button className="btn-del" onClick={(e) => this.onDelete(e, n)}
                                        title="Xoa">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    userInfo: state.user.userInfo
});
export default connect(mapStateToProps)(NotificationBell);
