import React, { Component } from 'react';
import { connect } from "react-redux";
import { Route, Switch } from 'react-router-dom';
import AdminHeader from '../containers/System/AdminHeader/AdminHeader';
import ManageSchedule from '../containers/System/Doctor/ManageSchedule';
import ManagePatient from '../containers/System/Doctor/ManagePatient';
import QueuePanel from '../containers/System/Doctor/QueuePanel';
import Sidebar from '../containers/System/Sidebar/Sidebar';
import './System.scss';

class Doctor extends Component {
    render() {
        // {this.props.isLoggedIn && <Header />}
        const { isLoggedIn } = this.props;
        return (
            <React.Fragment>
                {isLoggedIn && <Sidebar />}
                <div className="system-wrapper">
                    <div className="system-container with-sidebar">
                        {isLoggedIn && <AdminHeader />}
                        <div className="system-content">
                            <Switch>
                                <Route path="/doctor/manage-schedule" component={ManageSchedule} />
                                <Route path="/doctor/manage-patient" component={ManagePatient} />
                                <Route path="/doctor/queue-panel" component={QueuePanel} />
                            </Switch>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        DoctorMenuPath: state.app.DoctorMenuPath,
        isLoggedIn: state.user.isLoggedIn // check if user login success
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
