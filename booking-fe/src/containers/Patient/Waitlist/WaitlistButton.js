import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addToWaitlistService } from '../../../services/userService';
import { toast } from 'react-toastify';
import { path } from '../../../utils';
import './WaitlistButton.scss';

class WaitlistButton extends Component {
    state = { showForm: false, preferredDate: '', note: '', submitting: false };

    handleJoin = async () => {
        const { userInfo, isLoggedIn, doctorId } = this.props;
        if (!isLoggedIn || !userInfo?.id) {
            if (this.props.history) this.props.history.push(path.LOGIN_CLIENT);
            else window.location.href = path.LOGIN_CLIENT;
            return;
        }
        if (!doctorId) return;
        this.setState({ submitting: true });
        try {
            const res = await addToWaitlistService({
                doctorId,
                preferredDate: this.state.preferredDate || null,
                note: this.state.note || null
            });
            if (res && res.errCode === 0) {
                toast.success('Da them vao danh sach cho. Se thong bao khi co slot.');
                this.setState({ showForm: false, preferredDate: '', note: '' });
            } else {
                toast.warn(res?.errMessage || 'Khong them duoc');
            }
        } catch (e) { toast.error('Loi ket noi'); }
        finally { this.setState({ submitting: false }); }
    };

    render() {
        const { showForm, preferredDate, note, submitting } = this.state;
        return (
            <div className="waitlist-button">
                {!showForm ? (
                    <button className="btn btn-outline-primary btn-wl"
                        onClick={() => this.setState({ showForm: true })}>
                        <i className="fas fa-user-clock"></i> Dang ky cho slot trong
                    </button>
                ) : (
                    <div className="wl-form">
                        <div className="wl-title">Dang ky danh sach cho</div>
                        <label>Ngay mong muon (tuy chon)</label>
                        <input type="text" placeholder="DD/MM/YYYY"
                            value={preferredDate}
                            onChange={e => this.setState({ preferredDate: e.target.value })} />
                        <label>Ghi chu (tuy chon)</label>
                        <textarea rows={2} value={note}
                            onChange={e => this.setState({ note: e.target.value })} />
                        <div className="wl-actions">
                            <button className="btn btn-primary" disabled={submitting}
                                onClick={this.handleJoin}>
                                {submitting ? 'Dang gui...' : 'Dang ky'}
                            </button>
                            <button className="btn btn-outline-secondary"
                                onClick={() => this.setState({ showForm: false })}>Huy</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo
});
export default connect(mapStateToProps)(WaitlistButton);
