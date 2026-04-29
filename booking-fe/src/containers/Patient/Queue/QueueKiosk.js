import React, { Component } from 'react';
import { getKioskQueueService } from '../../../services/userService';
import { connectSocket, joinRooms, onSocket } from '../../../services/socket';
import './QueueKiosk.scss';

class QueueKiosk extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true,
            time: new Date()
        };
        this._unsubs = [];
        this._timer = null;
    }

    async componentDidMount() {
        const { doctorId } = this.props.match?.params || {};
        if (!doctorId) return;

        connectSocket();
        joinRooms({ doctorId });

        await this.load();

        this._unsubs.push(onSocket('queue:called', () => this.load()));
        this._unsubs.push(onSocket('queue:done', () => this.load()));
        this._unsubs.push(onSocket('queue:refreshed', () => this.load()));
        this._unsubs.push(onSocket('queue:empty', () => this.load()));

        this._timer = setInterval(() => this.setState({ time: new Date() }), 1000);
        this._refreshTimer = setInterval(() => this.load(), 30000);
    }

    componentWillUnmount() {
        this._unsubs.forEach(u => typeof u === 'function' && u());
        if (this._timer) clearInterval(this._timer);
        if (this._refreshTimer) clearInterval(this._refreshTimer);
    }

    load = async () => {
        const { doctorId } = this.props.match?.params || {};
        if (!doctorId) return;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const res = await getKioskQueueService(doctorId, String(today.getTime()));
            if (res && res.errCode === 0) {
                this.setState({ data: res.data, loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) { this.setState({ loading: false }); }
    };

    render() {
        const { data, loading, time } = this.state;
        return (
            <div className="queue-kiosk">
                <div className="kiosk-header">
                    <div className="clinic">
                        <i className="fas fa-hospital"></i> BOOKINGCARE
                    </div>
                    <div className="clock">
                        {time.toLocaleTimeString('vi-VN')} &middot; {time.toLocaleDateString('vi-VN')}
                    </div>
                </div>

                {loading ? (
                    <div className="kiosk-loading">Dang tai...</div>
                ) : !data ? (
                    <div className="kiosk-empty">Khong co du lieu</div>
                ) : (
                    <>
                        <div className="kiosk-doctor">
                            <span className="label">BAC SI</span>
                            <span className="name">{data.doctorName || `#${data.doctorId}`}</span>
                        </div>

                        <div className="kiosk-main">
                            <div className="current-panel">
                                <div className="label">DANG GOI SO</div>
                                {data.current ? (
                                    <>
                                        <div className="big-number">{data.current.queueNumber || '-'}</div>
                                        <div className="current-name">{data.current.patient}</div>
                                    </>
                                ) : (
                                    <div className="big-number idle">—</div>
                                )}
                            </div>

                            <div className="waiting-panel">
                                <div className="label">CAC SO TIEP THEO</div>
                                {data.waiting.length === 0 ? (
                                    <div className="no-waiting">Khong con ai cho</div>
                                ) : (
                                    <ul className="waiting-list">
                                        {data.waiting.map((w, i) => (
                                            <li key={i}>
                                                <span className="n">{w.queueNumber}</span>
                                                <span className="p">{w.patient}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="waiting-meta">
                                    Tong cho: <b>{data.totalWaiting || 0}</b> - Da kham: <b>{data.doneCount || 0}</b>
                                </div>
                            </div>
                        </div>

                        <div className="kiosk-footer">
                            Man hinh tu dong cap nhat &middot; Benh nhan vui long theo doi so goi
                        </div>
                    </>
                )}
            </div>
        );
    }
}

export default QueueKiosk;
