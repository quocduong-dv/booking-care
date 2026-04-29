import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import UserManage from '../containers/System/UserManage';
import UserRedux from '../containers/System/Admin/UserRedux';
import Header from '../containers/Header/Header';
import Sidebar from '../containers/System/Sidebar/Sidebar'; // Import Sidebar
import AdminHeader from '../containers/System/AdminHeader/AdminHeader';
import ManageDoctor from '../containers/System/Admin/ManageDoctor';
import ManageSpeciatly from '../containers/System/Specialty/ManageSpeciatly';
import TableManageSpecialty from '../containers/System/Specialty/TableManageSpecialty';
import ManageClinic from '../containers/System/Clinic/ManageClinic';
import TableManageClinic from '../containers/System/Clinic/TableManageClinic';
import HandBook from '../containers/System/Handbook/HandBook';
import TableManageHandbook from '../containers/System/Handbook/TableManageHandbook';
import Dashboard from '../containers/System/Dashboard/Dashboard';
import ManageAppointment from '../containers/System/Appointment/ManageAppointment';
import ManageFollowUp from '../containers/System/Appointment/ManageFollowUp';
import DoctorRevenue from '../containers/System/Revenue/DoctorRevenue';
import ManagePrescription from '../containers/System/Prescription/ManagePrescription';
import ManageLeave from '../containers/System/Doctor/ManageLeave';
import ManageWorkSchedule from '../containers/System/Doctor/ManageWorkSchedule';
import ManagePayment from '../containers/System/Payment/ManagePayment';
import MyReviews from '../containers/System/Doctor/MyReviews';
import DoctorChat from '../containers/System/Doctor/Chat';
import ManageMedicine from '../containers/System/Medicine/ManageMedicine';
import ManageAudit from '../containers/System/Audit/ManageAudit';
import ManageVoucher from '../containers/System/Voucher/ManageVoucher';
import ManageReview from '../containers/System/Review/ManageReview';
import ManageMedicineBatches from '../containers/System/Medicine/ManageMedicineBatches';
import NoShowReport from '../containers/System/Dashboard/NoShowReport';
import DoctorWaitlist from '../containers/System/Doctor/DoctorWaitlist';
import './System.scss'; // New SCSS for layout

class System extends Component {
    render() {
        const { systemMenuPath, isLoggedIn } = this.props;
        return (
            <div className="system-wrapper">
                {isLoggedIn && <Sidebar />}
                <div className={isLoggedIn ? "system-container with-sidebar" : "system-container"}>
                    {isLoggedIn && <AdminHeader />}
                    <div className="system-content">
                        <Switch>
                            <Route path="/system/dashboard" component={Dashboard} />
                            <Route path="/system/user-manage" component={UserManage} />
                            <Route path="/system/user-redux" component={UserRedux} />
                            <Route path="/system/manager-doctor" component={ManageDoctor} />
                            <Route path="/system/manage-specialty-list" component={TableManageSpecialty} />
                            <Route path="/system/manage-specialty" component={ManageSpeciatly} />
                            <Route path="/system/manage-clinic" component={ManageClinic} />
                            <Route path="/system/manage-clinic-list" component={TableManageClinic} />
                            <Route path="/system/manage-handbook" component={HandBook} />
                            <Route path="/system/manage-handbook-list" component={TableManageHandbook} />
                            <Route path="/system/manage-appointment" component={ManageAppointment} />
                            <Route path="/system/manage-follow-up" component={ManageFollowUp} />
                            <Route path="/system/doctor-revenue" component={DoctorRevenue} />
                            <Route path="/system/manage-prescription" component={ManagePrescription} />
                            <Route path="/system/manage-doctor-leave" component={ManageLeave} />
                            <Route path="/system/manage-work-schedule" component={ManageWorkSchedule} />
                            <Route path="/system/manage-payment" component={ManagePayment} />
                            <Route path="/system/my-reviews" component={MyReviews} />
                            <Route path="/system/doctor-chat" component={DoctorChat} />
                            <Route path="/system/manage-medicine" component={ManageMedicine} />
                            <Route path="/system/manage-audit" component={ManageAudit} />
                            <Route path="/system/manage-voucher" component={ManageVoucher} />
                            <Route path="/system/manage-review" component={ManageReview} />
                            <Route path="/system/manage-medicine-batches" component={ManageMedicineBatches} />
                            <Route path="/system/no-show-report" component={NoShowReport} />
                            <Route path="/system/doctor-waitlist" component={DoctorWaitlist} />
                            <Route component={() => { return (<Redirect to={systemMenuPath} />) }} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        systemMenuPath: state.app.systemMenuPath,
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
