import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import {
    getQueueByDoctorService,
    getUnreadByDoctorService
} from '../../../services/userService';
import { connectSocket, onSocket, joinRooms } from '../../../services/socket';
import ChatBox from '../../Chat/ChatBox';
import './Chat.scss';

class DoctorChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bookings: [],
            unreadMap: {},
            selectedBookingId: null,
            loading: true
        };
        this._unsubs = [];
    }

    async componentDidMount() {
        const { userInfo } = this.props;
        if (!userInfo?.id) return;

        connectSocket();
        joinRooms({ role: 'R2', userId: userInfo.id });

        await this.loadBookings();
        await this.loadUnread();

        this._unsubs.push(onSocket('chat:new', this.handleIncomingMessage));
    }

    componentWillUnmount() {
        this._unsubs.forEach(u => typeof u === 'function' && u());
    }

    handleIncomingMessage = (msg) => {
        if (!msg) return;
        const bid = msg.bookingId;
        if (Number(bid) === Number(this.state.selectedBookingId)) return;
        if (msg.senderRole !== 'patient') return;
        this.setState(prev => ({
            unreadMap: { ...prev.unreadMap, [bid]: (prev.unreadMap[bid] || 0) + 1 }
        }));
    };

    loadBookings = async () => {
        const { userInfo } = this.props;
        const today = moment().format('DD/MM/YYYY');
        try {
            const res = await getQueueByDoctorService(userInfo.id, today);
            if (res && res.errCode === 0) {
                this.setState({ bookings: res.data || [], loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    loadUnread = async () => {
        const { userInfo } = this.props;
        try {
            const res = await getUnreadByDoctorService(userInfo.id);
            if (res && res.errCode === 0) {
                const map = {};
                (res.data?.byBooking || []).forEach(r => { map[r.bookingId] = r.unreadCount; });
                this.setState({ unreadMap: map });
            }
        } catch (e) { /* ignore */ }
    };

    selectBooking = (bookingId) => {
        this.setState(prev => ({
            selectedBookingId: bookingId,
            unreadMap: { ...prev.unreadMap, [bookingId]: 0 }
        }));
    };

    render() {
        const { userInfo } = this.props;
        const { bookings, unreadMap, selectedBookingId, loading } = this.state;

        return (
            <div className="doctor-chat-page">
                <div className="sidebar">
                    <h4>Benh nhan hom nay</h4>
                    {loading ? (
                        <div className="empty">Dang tai...</div>
                    ) : bookings.length === 0 ? (
                        <div className="empty">Khong co benh nhan nao.</div>
                    ) : (
                        <ul>
                            {bookings.map(b => {
                                const unread = unreadMap[b.id] || 0;
                                const name = b.patientData
                                    ? `${b.patientData.firstName || ''}`.trim()
                                    : `#${b.id}`;
                                return (
                                    <li
                                        key={b.id}
                                        className={selectedBookingId === b.id ? 'selected' : ''}
                                        onClick={() => this.selectBooking(b.id)}
                                    >
                                        <span className="name">
                                            {b.queueNumber ? `#${b.queueNumber} - ` : ''}{name}
                                        </span>
                                        {unread > 0 && <span className="badge">{unread}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <div className="main">
                    {selectedBookingId ? (
                        <ChatBox
                            bookingId={selectedBookingId}
                            currentUserId={userInfo.id}
                            currentUserRole="doctor"
                            peerName={(() => {
                                const b = bookings.find(x => x.id === selectedBookingId);
                                return b?.patientData?.firstName || 'Benh nhan';
                            })()}
                        />
                    ) : (
                        <div className="placeholder">Chon mot benh nhan de bat dau tro chuyen.</div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ userInfo: state.user.userInfo });
export default connect(mapStateToProps)(DoctorChat);
