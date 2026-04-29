import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorRevenue.scss';
import Select from 'react-select';
import DatePicker from '../../../components/Input/DatePicker';
import * as actions from '../../../store/actions';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getAllDoctorRevenueSummary, getDoctorRevenue } from '../../../services/userService';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import { exportToExcel, printTable } from '../../../utils/excelExport';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

class DoctorRevenue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listDoctors: [],
            selectedDoctor: '',
            selectedPeriod: { label: 'Tháng này', value: 'month' },
            startDate: moment().startOf('month').valueOf(),
            endDate: moment().endOf('month').valueOf(),
            revenueSummary: [],
            revenueDetail: [],
            totalRevenue: 0,
            totalAppointments: 0,
            isShowLoading: false,
            currentPage: 1,
            itemsPerPage: 15
        }
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        await this.loadRevenueSummary();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allDoctors !== this.props.allDoctors) {
            let dataSelect = this.buildDoctorSelect(this.props.allDoctors);
            this.setState({ listDoctors: dataSelect });
        }
    }

    buildDoctorSelect = (inputData) => {
        let result = [{ label: '-- Tất cả bác sĩ --', value: '' }];
        let { language } = this.props;
        if (inputData && inputData.length > 0) {
            inputData.forEach((item) => {
                let labelVi = `${item.lastName} ${item.firstName}`;
                let labelEn = `${item.firstName} ${item.lastName}`;
                result.push({
                    label: language === LANGUAGES.VI ? labelVi : labelEn,
                    value: item.id
                });
            });
        }
        return result;
    }

    loadRevenueSummary = async () => {
        this.setState({ isShowLoading: true });
        let { selectedDoctor, selectedPeriod, startDate, endDate } = this.state;
        try {
            let doctorId = selectedDoctor ? selectedDoctor.value || '' : '';

            if (doctorId) {
                // Detail for specific doctor
                let res = await getDoctorRevenue({
                    doctorId,
                    period: selectedPeriod.value,
                    startDate: new Date(startDate).getTime(),
                    endDate: new Date(endDate).getTime()
                });
                if (res && res.errCode === 0) {
                    this.setState({
                        revenueDetail: res.data || [],
                        revenueSummary: [],
                        totalRevenue: res.totalRevenue || 0,
                        totalAppointments: res.totalAppointments || 0,
                        isShowLoading: false
                    });
                } else {
                    this.setState({ revenueDetail: [], isShowLoading: false });
                }
            } else {
                // Summary for all doctors
                let res = await getAllDoctorRevenueSummary({
                    period: selectedPeriod.value,
                    startDate: new Date(startDate).getTime(),
                    endDate: new Date(endDate).getTime()
                });
                if (res && res.errCode === 0) {
                    let data = res.data || [];
                    let total = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
                    let totalAppt = data.reduce((sum, item) => sum + (item.appointmentCount || 0), 0);
                    this.setState({
                        revenueSummary: data,
                        revenueDetail: [],
                        totalRevenue: total,
                        totalAppointments: totalAppt,
                        isShowLoading: false
                    });
                } else {
                    this.setState({ revenueSummary: [], isShowLoading: false });
                }
            }
        } catch (e) {
            console.log('loadRevenueSummary error:', e);
            this.setState({ isShowLoading: false });
        }
    }

    handleChangeDoctor = (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption, currentPage: 1 });
    }

    handleChangePeriod = (selectedOption) => {
        let start, end;
        switch (selectedOption.value) {
            case 'week':
                start = moment().startOf('week').valueOf();
                end = moment().endOf('week').valueOf();
                break;
            case 'month':
                start = moment().startOf('month').valueOf();
                end = moment().endOf('month').valueOf();
                break;
            case 'quarter':
                start = moment().startOf('quarter').valueOf();
                end = moment().endOf('quarter').valueOf();
                break;
            case 'year':
                start = moment().startOf('year').valueOf();
                end = moment().endOf('year').valueOf();
                break;
            default:
                start = this.state.startDate;
                end = this.state.endDate;
        }
        this.setState({
            selectedPeriod: selectedOption,
            startDate: start,
            endDate: end,
            currentPage: 1
        });
    }

    handleStartDateChange = (date) => {
        this.setState({
            startDate: date[0],
            selectedPeriod: { label: 'Tùy chọn', value: 'custom' }
        });
    }

    handleEndDateChange = (date) => {
        this.setState({
            endDate: date[0],
            selectedPeriod: { label: 'Tùy chọn', value: 'custom' }
        });
    }

    handleSearch = async () => {
        await this.loadRevenueSummary();
    }

    handleExportCSV = () => {
        const { revenueSummary, revenueDetail, selectedDoctor } = this.state;
        const isDetail = selectedDoctor && selectedDoctor.value;
        const data = isDetail ? revenueDetail : revenueSummary;

        if (!data || data.length === 0) {
            toast.warning('Không có dữ liệu để xuất!');
            return;
        }

        const rows = data.map((item, i) => ({ ...item, __idx: i + 1 }));
        const cols = isDetail ? [
            { key: '__idx', label: 'STT' },
            { key: 'date', label: 'Ngày', get: r => r.date ? moment(+r.date).format('DD/MM/YYYY') : '' },
            { key: 'patientName', label: 'Bệnh nhân' },
            { key: 'serviceName', label: 'Dịch vụ' },
            { key: 'amount', label: 'Số tiền', get: r => Number(r.amount) || 0 }
        ] : [
            { key: '__idx', label: 'STT' },
            { key: 'doctorName', label: 'Bác sĩ' },
            { key: 'appointmentCount', label: 'Số lịch hẹn', get: r => Number(r.appointmentCount) || 0 },
            { key: 'revenue', label: 'Doanh thu (VND)', get: r => Number(r.revenue) || 0 }
        ];

        exportToExcel(`doanh-thu-${moment().format('DDMMYYYY')}.xlsx`, rows, cols);
        toast.success('Xuất file Excel thành công!');
    }


    handlePrint = () => {
        const { revenueSummary, revenueDetail, selectedDoctor } = this.state;
        const isDetail = selectedDoctor && selectedDoctor.value;
        const rows = isDetail ? revenueDetail : revenueSummary;
        if (!rows || rows.length === 0) { toast.warning('Khong co du lieu de in'); return; }
        const cols = isDetail ? [
            { key: 'date', label: 'Ngay', get: r => r.date ? moment(+r.date).format('DD/MM/YYYY') : '' },
            { key: 'patientName', label: 'Benh nhan' },
            { key: 'serviceName', label: 'Dich vu' },
            { key: 'amount', label: 'So tien', get: r => this.formatCurrency(r.amount || 0) }
        ] : [
            { key: 'doctorName', label: 'Bac si' },
            { key: 'appointmentCount', label: 'Lich hen' },
            { key: 'revenue', label: 'Doanh thu', get: r => this.formatCurrency(r.revenue || 0) }
        ];
        printTable(isDetail
            ? `Doanh thu bac si - ${selectedDoctor.label}`
            : 'Doanh thu tong hop', rows, cols);
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    }

    render() {
        let { language } = this.props;
        let {
            listDoctors, revenueSummary, revenueDetail, selectedDoctor,
            totalRevenue, totalAppointments, isShowLoading, currentPage, itemsPerPage
        } = this.state;

        let periodOptions = [
            { label: 'Tuần này', value: 'week' },
            { label: 'Tháng này', value: 'month' },
            { label: 'Quý này', value: 'quarter' },
            { label: 'Năm nay', value: 'year' },
            { label: 'Tùy chọn', value: 'custom' },
        ];

        let isDetailView = selectedDoctor && selectedDoctor.value;
        let tableData = isDetailView ? revenueDetail : revenueSummary;

        // Pagination
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = tableData.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(tableData.length / itemsPerPage);

        // Chart data for summary view
        let chartData = revenueSummary.map(item => ({
            name: item.doctorName || '',
            revenue: item.revenue || 0,
            appointments: item.appointmentCount || 0
        }));

        // Chart data for detail view
        let detailChartData = revenueDetail.map(item => ({
            name: item.date ? moment(+item.date).format('DD/MM') : '',
            amount: item.amount || 0
        }));

        return (
            <LoadingOverlay active={isShowLoading} spinner text='Loading...'>
                <div className="doctor-revenue-container">
                    <div className="dr-title">Thống kê doanh thu bác sĩ</div>

                    {/* Filter */}
                    <div className="dr-filter row">
                        <div className="col-3 form-group">
                            <label>Bác sĩ</label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeDoctor}
                                options={listDoctors}
                                placeholder="-- Tất cả bác sĩ --"
                            />
                        </div>
                        <div className="col-2 form-group">
                            <label>Kỳ</label>
                            <Select
                                value={this.state.selectedPeriod}
                                onChange={this.handleChangePeriod}
                                options={periodOptions}
                            />
                        </div>
                        <div className="col-2 form-group">
                            <label>Từ ngày</label>
                            <DatePicker
                                onChange={this.handleStartDateChange}
                                className="form-control"
                                value={this.state.startDate}
                            />
                        </div>
                        <div className="col-2 form-group">
                            <label>Đến ngày</label>
                            <DatePicker
                                onChange={this.handleEndDateChange}
                                className="form-control"
                                value={this.state.endDate}
                            />
                        </div>
                        <div className="col-3 form-group d-flex align-items-end gap-2">
                            <button className="btn btn-primary" onClick={this.handleSearch}>
                                <i className="fas fa-search"></i> Tìm kiếm
                            </button>
                            <button className="btn btn-success" onClick={this.handleExportCSV}>
                                <i className="fas fa-file-excel"></i> Xuất Excel
                            </button>
                            <button className="btn btn-outline-secondary" onClick={this.handlePrint}>
                                <i className="fas fa-print"></i> In
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="dr-summary">
                        <div className="summary-card revenue-card">
                            <i className="fas fa-money-bill-wave"></i>
                            <div className="summary-info">
                                <div className="summary-number">{this.formatCurrency(totalRevenue)}</div>
                                <div className="summary-label">Tổng doanh thu</div>
                            </div>
                        </div>
                        <div className="summary-card appointment-card">
                            <i className="fas fa-calendar-check"></i>
                            <div className="summary-info">
                                <div className="summary-number">{totalAppointments}</div>
                                <div className="summary-label">Tổng lịch hẹn</div>
                            </div>
                        </div>
                        <div className="summary-card avg-card">
                            <i className="fas fa-chart-line"></i>
                            <div className="summary-info">
                                <div className="summary-number">
                                    {totalAppointments > 0 ? this.formatCurrency(totalRevenue / totalAppointments) : '0 ₫'}
                                </div>
                                <div className="summary-label">Trung bình/lịch hẹn</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="dr-chart">
                        <div className="chart-title">
                            {isDetailView ? 'Doanh thu theo ngày' : 'Doanh thu theo bác sĩ'}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            {isDetailView ? (
                                <LineChart data={detailChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => this.formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#007bff" name="Doanh thu" strokeWidth={2} />
                                </LineChart>
                            ) : (
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" orientation="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip formatter={(value, name) =>
                                        name === 'Doanh thu' ? this.formatCurrency(value) : value
                                    } />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
                                    <Bar yAxisId="right" dataKey="appointments" fill="#8884d8" name="Lịch hẹn" />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="dr-table">
                        <table id="TableDoctorRevenue">
                            <tbody>
                                {isDetailView ? (
                                    <>
                                        <tr>
                                            <th>STT</th>
                                            <th>Ngày</th>
                                            <th>Bệnh nhân</th>
                                            <th>Dịch vụ</th>
                                            <th>Số tiền</th>
                                        </tr>
                                        {currentItems && currentItems.length > 0 ? (
                                            currentItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{indexOfFirst + index + 1}</td>
                                                    <td>{item.date ? moment(+item.date).format('DD/MM/YYYY') : ''}</td>
                                                    <td>{item.patientName || ''}</td>
                                                    <td>{item.serviceName || ''}</td>
                                                    <td className="text-right">{this.formatCurrency(item.amount || 0)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                                            </tr>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <th>STT</th>
                                            <th>Bác sĩ</th>
                                            <th>Số lịch hẹn</th>
                                            <th>Doanh thu</th>
                                            <th>TB/lịch hẹn</th>
                                        </tr>
                                        {currentItems && currentItems.length > 0 ? (
                                            currentItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{indexOfFirst + index + 1}</td>
                                                    <td>{item.doctorName || ''}</td>
                                                    <td>{item.appointmentCount || 0}</td>
                                                    <td className="text-right">{this.formatCurrency(item.revenue || 0)}</td>
                                                    <td className="text-right">
                                                        {item.appointmentCount > 0
                                                            ? this.formatCurrency((item.revenue || 0) / item.appointmentCount)
                                                            : '0 ₫'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="revenue-pagination">
                            <button disabled={currentPage === 1}
                                onClick={() => this.handlePageChange(currentPage - 1)}>
                                &laquo;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => this.handlePageChange(i + 1)}>
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={currentPage === totalPages}
                                onClick={() => this.handlePageChange(currentPage + 1)}>
                                &raquo;
                            </button>
                        </div>
                    )}
                </div>
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        allDoctors: state.admin.allDoctors,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorRevenue);
