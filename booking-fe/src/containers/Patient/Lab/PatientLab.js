import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getLabResultsByPatientService } from '../../../services/userService';
import { path } from '../../../utils';
import './PatientLab.scss';

class PatientLab extends Component {
    state = { items: [], loading: true };

    async componentDidMount() {
        const { userInfo } = this.props;
        if (!userInfo?.id) { this.setState({ loading: false }); return; }
        try {
            const res = await getLabResultsByPatientService(userInfo.id);
            if (res && res.errCode === 0) {
                this.setState({ items: res.data || [], loading: false });
            } else { this.setState({ loading: false }); }
        } catch (e) { this.setState({ loading: false }); }
    }

    render() {
        const { isLoggedIn } = this.props;
        const { items, loading } = this.state;
        if (!isLoggedIn) return <Redirect to={path.LOGIN_CLIENT} />;

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="patient-lab container">
                    <h2>Ket qua xet nghiem</h2>
                    {loading ? <div className="loading">Dang tai...</div> : items.length === 0 ? (
                        <div className="empty">Ban chua co ket qua xet nghiem nao.</div>
                    ) : (
                        <div className="lab-list">
                            {items.map(it => (
                                <div className="lab-card" key={it.id}>
                                    <div className="head">
                                        <strong>{it.testType}</strong>
                                        <span className="date">
                                            {it.testDate || new Date(it.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {it.resultText && <div className="text">{it.resultText}</div>}
                                    {it.fileUrl && (
                                        <div className="file">
                                            <a href={it.fileUrl} target="_blank" rel="noopener noreferrer"
                                                download={it.fileName || 'lab'}>
                                                <i className="fas fa-file-download"></i> {it.fileName || 'Tai xuong'}
                                            </a>
                                        </div>
                                    )}
                                    {it.notes && <div className="notes"><i>Ghi chu: {it.notes}</i></div>}
                                    {it.doctorData && (
                                        <div className="doctor">
                                            Bac si: {it.doctorData.lastName} {it.doctorData.firstName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo
});
export default connect(mapStateToProps)(PatientLab);
