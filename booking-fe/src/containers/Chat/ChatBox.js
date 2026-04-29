import React, { Component } from 'react';
import {
    sendMessageService,
    getMessagesService
} from '../../services/userService';
import { connectSocket, onSocket, joinRooms, leaveRooms } from '../../services/socket';
import './ChatBox.scss';

class ChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            input: '',
            loading: true,
            sending: false
        };
        this._unsubs = [];
        this._listRef = React.createRef();
    }

    async componentDidMount() {
        const { bookingId } = this.props;
        if (!bookingId) return;
        connectSocket();
        joinRooms({ bookingId });
        await this.loadHistory();

        this._unsubs.push(onSocket('chat:new', this.handleNewMessage));
    }

    async componentDidUpdate(prev) {
        if (prev.bookingId !== this.props.bookingId) {
            leaveRooms({ bookingId: prev.bookingId });
            joinRooms({ bookingId: this.props.bookingId });
            await this.loadHistory();
        }
    }

    componentWillUnmount() {
        const { bookingId } = this.props;
        this._unsubs.forEach(u => typeof u === 'function' && u());
        leaveRooms({ bookingId });
    }

    handleNewMessage = (msg) => {
        if (!msg || Number(msg.bookingId) !== Number(this.props.bookingId)) return;
        this.setState(prev => {
            if (prev.messages.some(m => m.id === msg.id)) return prev;
            return { messages: [...prev.messages, msg] };
        }, this.scrollToBottom);
    };

    loadHistory = async () => {
        const { bookingId, currentUserId } = this.props;
        this.setState({ loading: true });
        try {
            const res = await getMessagesService(bookingId, currentUserId);
            if (res && res.errCode === 0) {
                this.setState({ messages: res.data || [], loading: false }, this.scrollToBottom);
            } else {
                this.setState({ loading: false });
            }
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    scrollToBottom = () => {
        const el = this._listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    };

    handleSend = async () => {
        const { bookingId, currentUserId, currentUserRole } = this.props;
        const content = this.state.input.trim();
        if (!content || !bookingId || !currentUserId) return;

        this.setState({ sending: true });
        try {
            const res = await sendMessageService({
                bookingId,
                senderId: currentUserId,
                senderRole: currentUserRole,
                content
            });
            if (res && res.errCode === 0) {
                this.handleNewMessage(res.data);
                this.setState({ input: '' });
            } else {
                alert(res?.errMessage || 'Khong gui duoc tin nhan');
            }
        } catch (e) {
            alert('Loi ket noi');
        } finally {
            this.setState({ sending: false });
        }
    };

    handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
    };

    render() {
        const { currentUserId, currentUserRole, peerName, disabled } = this.props;
        const { messages, input, loading, sending } = this.state;

        return (
            <div className="chatbox">
                <div className="chatbox-header">
                    <strong>{peerName || (currentUserRole === 'doctor' ? 'Benh nhan' : 'Bac si')}</strong>
                </div>
                <div className="chatbox-body" ref={this._listRef}>
                    {loading ? (
                        <div className="empty">Dang tai...</div>
                    ) : messages.length === 0 ? (
                        <div className="empty">Chua co tin nhan. Hay bat dau cuoc tro chuyen.</div>
                    ) : (
                        messages.map(m => {
                            const mine = Number(m.senderId) === Number(currentUserId)
                                && m.senderRole === currentUserRole;
                            return (
                                <div key={m.id} className={`msg ${mine ? 'mine' : 'theirs'}`}>
                                    <div className="bubble">{m.content}</div>
                                    <div className="time">
                                        {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="chatbox-input">
                    <textarea
                        rows={2}
                        value={input}
                        placeholder={disabled ? 'Cuoc hoi thoai da dong' : 'Nhap tin nhan...'}
                        disabled={disabled || sending}
                        onChange={(e) => this.setState({ input: e.target.value })}
                        onKeyDown={this.handleKeyDown}
                    />
                    <button
                        className="btn btn-primary"
                        disabled={disabled || sending || !input.trim()}
                        onClick={this.handleSend}
                    >
                        Gui
                    </button>
                </div>
            </div>
        );
    }
}

export default ChatBox;
