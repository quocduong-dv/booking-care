import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getPatientQueueStatusService } from '../../../services/userService';
import { connectSocket, onSocket, joinRooms, leaveRooms } from '../../../services/socket';
import ReviewModal from '../Review/ReviewModal';
import ChatBox from '../../Chat/ChatBox';
import './PatientQueueStatus.scss';

class PatientQueueStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
            error: null,
            showReview: false,
            showChat: false
        };
        this._unsubs = [];
    }

    getBookingId = () => {
        return this.props.match?.params?.bookingId;
    };

    async componentDidMount() {
        const bookingId = this.getBookingId();
        if (!bookingId) {
            this.setState({ loading: false, error: 'Thieu bookingId' });
            return;
        }
        connectSocket();
        joinRooms({ bookingId });

        await this.loadStatus();

        this._unsubs.push(onSocket('queue:called', () => this.loadStatus()));
        this._unsubs.push(onSocket('queue:done', () => this.loadStatus()));
        this._unsubs.push(onSocket('booking:statusChanged', () => this.loadStatus()));
    }

    componentWillUnmount() {
        this._unsubs.forEach(u => typeof u === 'function' && u());
        leaveRooms({ bookingId: this.getBookingId() });
    }

    loadStatus = async () => {
        try {
            const res = await getPatientQueueStatusService(this.getBookingId());
            if (res && res.errCode === 0) {
                this.setState({ loading: false, data: res.data, error: null });
            } else {
                this.setState({ loading: false, error: res?.errMessage || 'Khong tim thay lich hen' });
            }
        } catch (e) {
            this.setState({ loading: false, error: 'Loi ket noi' });
        }
    };

    renderStatusBlock() {
        const { data } = this.state;
        if (!data) return null;

        const isMe = data.servedStatus === 'in_progress';
        const isDone = data.servedStatus === 'done';

        if (isMe) {
            return (
                <div className="state-block calling">
                    <div className="label">Den luot ban</div>
                    <div className="big-number">#{data.queueNumber}</div>
                    <div className="hint">Vui long vao phong kham ngay!</div>
                </div>
            );
        }
        if (isDone) {
            return (
                <div className="state-block done">
                    <div className="label">Ban da kham xong</div>
                    <div className="big-number">✓</div>
                    <div className="hint">Cam on ban!</div>
                    <button
                        className="btn btn-warning mt-3"
                        onClick={() => this.setState({ showReview: true })}
                    >
                        Danh gia bac si
                    </button>
                </div>
            );
        }
        return (
            <div className="state-block waiting">
                <div className="label">So cua ban</div>
                <div className="big-number">#{data.queueNumber || '—'}</div>
                <div className="info">
                    {data.currentCalling !== null && data.currentCalling !== undefined ? (
                        <>Bac si dang kham: <strong>#{data.currentCalling}</strong></>
                    ) : (
                        <>Bac si chua goi benh nhan dau tien</>
                    )}
                </div>
                <div className="ahead">
                    <strong>{data.peopleAhead}</strong> nguoi cho truoc ban
                </div>
            </div>
        );
    }

    render() {
        const { loading, error, showReview, showChat, data } = this.state;
        const bookingId = this.getBookingId();
        const patientId = this.props.userInfo?.id;
        const canChat = !!this.props.isLoggedIn && !!patientId;

        return (
            <div className="patient-queue-page">
                <div className="queue-card">
                    <h2>Tinh trang hang doi</h2>
                    {loading && <div className="loading">Dang tai...</div>}
                    {error && <div className="error">{error}</div>}
                    {!loading && !error && this.renderStatusBlock()}
                    {!loading && !error && data && data.servedStatus !== 'done' && canChat && (
                        <button
                            className="btn btn-outline-primary chat-toggle"
                            onClick={() => this.setState({ showChat: !showChat })}
                        >
                            {showChat ? 'An khung chat' : 'Nhan tin bac si'}
                        </button>
                    )}
                    {showChat && canChat && (
                        <ChatBox
                            bookingId={bookingId}
                            currentUserId={patientId}
                            currentUserRole="patient"
                            peerName="Bac si"
                        />
                    )}
                    <div className="footer-note">
                        Trang nay tu dong cap nhat qua ket noi realtime. Khong can refresh.
                    </div>
                </div>
                <ReviewModal
                    isOpen={showReview}
                    toggle={() => this.setState({ showReview: !showReview })}
                    bookingId={bookingId}
                    patientId={patientId}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
    userInfo: state.user.userInfo,
    isLoggedIn: state.user.isLoggedIn
});
export default connect(mapStateToProps)(PatientQueueStatus);
