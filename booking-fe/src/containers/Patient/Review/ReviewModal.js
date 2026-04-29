import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { createReviewService, getReviewByBookingService } from '../../../services/userService';
import './ReviewModal.scss';

class ReviewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
            hoverRating: 0,
            comment: '',
            submitting: false,
            existed: null,
            message: ''
        };
    }

    async componentDidMount() {
        await this.checkExisted();
    }

    async componentDidUpdate(prev) {
        if (!prev.isOpen && this.props.isOpen) {
            this.setState({ rating: 0, hoverRating: 0, comment: '', message: '' });
            await this.checkExisted();
        }
    }

    checkExisted = async () => {
        const { bookingId } = this.props;
        if (!bookingId) return;
        try {
            const res = await getReviewByBookingService(bookingId);
            if (res && res.errCode === 0 && res.data) {
                this.setState({ existed: res.data });
            } else {
                this.setState({ existed: null });
            }
        } catch (e) {
            this.setState({ existed: null });
        }
    };

    handleSubmit = async () => {
        const { bookingId, patientId, onSubmitted } = this.props;
        const { rating, comment } = this.state;
        if (!rating) {
            this.setState({ message: 'Vui long chon so sao' });
            return;
        }
        if (!patientId) {
            this.setState({ message: 'Vui long dang nhap de danh gia' });
            return;
        }
        this.setState({ submitting: true, message: '' });
        try {
            const res = await createReviewService({ bookingId, patientId, rating, comment });
            if (res && res.errCode === 0) {
                this.setState({ existed: res.data, submitting: false });
                if (typeof onSubmitted === 'function') onSubmitted(res.data);
            } else {
                this.setState({ submitting: false, message: res?.errMessage || 'Loi gui danh gia' });
            }
        } catch (e) {
            this.setState({ submitting: false, message: 'Loi ket noi' });
        }
    };

    renderStars() {
        const { rating, hoverRating, existed } = this.state;
        const locked = !!existed;
        const shown = existed ? existed.rating : (hoverRating || rating);
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map(n => (
                    <span
                        key={n}
                        className={`star ${n <= shown ? 'active' : ''} ${locked ? 'locked' : ''}`}
                        onClick={() => !locked && this.setState({ rating: n })}
                        onMouseEnter={() => !locked && this.setState({ hoverRating: n })}
                        onMouseLeave={() => !locked && this.setState({ hoverRating: 0 })}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    }

    render() {
        const { isOpen, toggle } = this.props;
        const { existed, submitting, comment, message } = this.state;

        return (
            <Modal isOpen={isOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>
                    {existed ? 'Ban da danh gia' : 'Danh gia bac si'}
                </ModalHeader>
                <ModalBody>
                    <div className="review-modal-body">
                        {this.renderStars()}
                        {existed ? (
                            <div className="existed-comment">
                                {existed.comment || <i>Khong co binh luan</i>}
                            </div>
                        ) : (
                            <textarea
                                className="form-control"
                                rows={4}
                                placeholder="Chia se trai nghiem cua ban..."
                                value={comment}
                                onChange={(e) => this.setState({ comment: e.target.value })}
                            />
                        )}
                        {message && <div className="error-msg">{message}</div>}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggle}>Dong</button>
                    {!existed && (
                        <button
                            className="btn btn-primary"
                            onClick={this.handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Dang gui...' : 'Gui danh gia'}
                        </button>
                    )}
                </ModalFooter>
            </Modal>
        );
    }
}

export default ReviewModal;
