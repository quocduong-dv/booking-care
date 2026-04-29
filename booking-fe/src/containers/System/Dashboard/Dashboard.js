import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getDashboardCounts, getSpecialtyStats, getMonthlyAppointmentStats } from '../../../services/userService';
import { onSocket } from '../../../services/socket';
import { exportToExcel, printTable } from '../../../utils/excelExport';
import './Dashboard.scss';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell,
    RadialBarChart, RadialBar, ComposedChart, Line
} from 'recharts';

const PALETTE = {
    primary: '#4f8cff',
    secondary: '#6db3ff',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6'
};

const SPECIALTY_COLORS = [
    PALETTE.primary, PALETTE.success, PALETTE.warning, PALETTE.danger,
    PALETTE.purple, PALETTE.info, PALETTE.pink, PALETTE.teal
];

const formatVnd = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="chart-tooltip">
            {label && <div className="tt-label">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} className="tt-item">
                    <span className="tt-dot" style={{ background: p.color || p.fill }} />
                    <span className="tt-name">{p.name}:</span>
                    <span className="tt-val">{isCurrency ? formatVnd(p.value) : p.value}</span>
                </div>
            ))}
        </div>
    );
};

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            counts: {
                totalDoctors: 0,
                totalPatients: 0,
                totalAppointments: 0,
                newUsers: 0,
                weeklyRevenue: [],
                topDoctors: [],
                todayPatients: 0,
                cancelRate: 0
            },
            specialtyStats: [],
            monthlyStats: [],
            selectedYear: new Date().getFullYear()
        };
    }

    async componentDidMount() {
        await Promise.all([
            this.getAllCounts(),
            this.getSpecialtyData(),
            this.getMonthlyData()
        ]);
        this._unsubs = [
            onSocket('booking:new', () => this.refreshAll()),
            onSocket('payment:success', () => this.refreshAll()),
            onSocket('booking:statusChanged', () => this.refreshAll())
        ];
    }

    componentWillUnmount() {
        if (this._unsubs) this._unsubs.forEach(u => typeof u === 'function' && u());
    }

    refreshAll = () => {
        this.getAllCounts();
        this.getSpecialtyData();
        this.getMonthlyData();
    }

    getAllCounts = async () => {
        const res = await getDashboardCounts();
        if (res && res.errCode === 0) this.setState({ counts: res.data });
    }

    getSpecialtyData = async () => {
        try {
            const res = await getSpecialtyStats();
            if (res && res.errCode === 0) this.setState({ specialtyStats: res.data || [] });
        } catch (e) { /* ignore */ }
    }

    getMonthlyData = async () => {
        try {
            const res = await getMonthlyAppointmentStats(this.state.selectedYear);
            if (res && res.errCode === 0) this.setState({ monthlyStats: res.data || [] });
        } catch (e) { /* ignore */ }
    }

    handleChangeYear = (event) => {
        this.setState({ selectedYear: event.target.value }, () => this.getMonthlyData());
    }

    renderStatCard = ({ icon, label, value, cls, trend }) => (
        <div className={`stat-card ${cls}`}>
            <div className="stat-icon">
                <i className={icon}></i>
            </div>
            <div className="stat-body">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
                {trend !== undefined && (
                    <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
                        <i className={`fas fa-arrow-${trend >= 0 ? 'up' : 'down'}`}></i>
                        <span>{Math.abs(trend)}% so voi tuan truoc</span>
                    </div>
                )}
            </div>
        </div>
    );

    render() {
        const { counts, specialtyStats, monthlyStats, selectedYear } = this.state;
        const { weeklyRevenue, topDoctors } = counts;

        const dataRevenue = (weeklyRevenue || []).map(item => ({
            name: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
            revenue: Number(item.revenue || 0)
        }));

        const dataDoctors = (topDoctors || []).map(item => ({
            name: item.doctorData ? `${item.doctorData.lastName || ''} ${item.doctorData.firstName || ''}`.trim() : '—',
            revenue: Number(item.revenue || 0)
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const dataSpecialty = specialtyStats.map(item => ({
            name: item.name,
            value: item.count || 0
        }));

        const defaultMonths = Array.from({ length: 12 }, (_, i) => ({
            month: `T${i + 1}`, total: 0, done: 0, cancelled: 0
        }));
        const dataMonthly = monthlyStats.length > 0 ? monthlyStats : defaultMonths;

        const currentYear = new Date().getFullYear();
        const yearOptions = [];
        for (let y = currentYear; y >= currentYear - 5; y--) yearOptions.push(y);

        const todayPatients = counts.todayPatients || counts.newUsers || 0;
        const cancelRate = Number(counts.cancelRate || 0);
        const completionRate = Math.max(0, 100 - cancelRate);

        const radialData = [
            { name: 'Hoan thanh', value: completionRate, fill: PALETTE.success },
            { name: 'Huy', value: cancelRate, fill: PALETTE.danger }
        ];

        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="title">Tong quan</h1>
                        <p className="subtitle">Theo doi hoat dong he thong theo thoi gian thuc</p>
                    </div>
                    <div className="header-actions">
                        <span className="live-dot"></span>
                        <span>Realtime</span>
                        <button className="btn btn-sm btn-outline-success ml-2"
                            style={{ marginLeft: 8 }}
                            onClick={() => exportToExcel('dashboard-monthly.xlsx', this.state.monthlyStats, [
                                { key: 'month', label: 'Thang' },
                                { key: 'done', label: 'Hoan thanh' },
                                { key: 'cancelled', label: 'Huy' }
                            ])}>
                            <i className="fas fa-file-excel"></i> Excel
                        </button>
                        <button className="btn btn-sm btn-outline-secondary"
                            style={{ marginLeft: 4 }}
                            onClick={() => printTable('Tong quan dashboard', this.state.monthlyStats, [
                                { key: 'month', label: 'Thang' },
                                { key: 'done', label: 'Hoan thanh' },
                                { key: 'cancelled', label: 'Huy' }
                            ])}>
                            <i className="fas fa-print"></i> In
                        </button>
                    </div>
                </div>

                <div className="stat-grid">
                    {this.renderStatCard({
                        icon: 'fas fa-user-md', label: 'Tong bac si', value: counts.totalDoctors, cls: 'blue'
                    })}
                    {this.renderStatCard({
                        icon: 'fas fa-user-injured', label: 'Tong benh nhan', value: counts.totalPatients, cls: 'green'
                    })}
                    {this.renderStatCard({
                        icon: 'fas fa-calendar-check', label: 'Lich hen hoan thanh', value: counts.totalAppointments, cls: 'orange'
                    })}
                    {this.renderStatCard({
                        icon: 'fas fa-stethoscope', label: 'Kham hom nay', value: todayPatients, cls: 'teal'
                    })}
                    {this.renderStatCard({
                        icon: 'fas fa-user-plus', label: 'User moi hom nay', value: counts.newUsers, cls: 'purple'
                    })}
                    {this.renderStatCard({
                        icon: 'fas fa-times-circle', label: 'Ty le huy', value: `${cancelRate}%`, cls: 'red'
                    })}
                </div>

                <div className="chart-row two-cols">
                    <div className="chart-card span-2">
                        <div className="card-head">
                            <div>
                                <h3>Doanh thu tuan</h3>
                                <span className="card-subtitle">7 ngay gan nhat</span>
                            </div>
                            <span className="badge primary">
                                {formatVnd(dataRevenue.reduce((s, d) => s + d.revenue, 0))}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={dataRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={PALETTE.primary} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7b85a1' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7b85a1' }}
                                    tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v} />
                                <Tooltip content={<CustomTooltip isCurrency />} />
                                <Area type="monotone" dataKey="revenue" name="Doanh thu"
                                    stroke={PALETTE.primary} strokeWidth={2.5}
                                    fill="url(#revGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="card-head">
                            <div>
                                <h3>Ti le hoan thanh</h3>
                                <span className="card-subtitle">So voi lich huy</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadialBarChart
                                cx="50%" cy="50%"
                                innerRadius="55%" outerRadius="95%"
                                barSize={14}
                                data={radialData}
                                startAngle={90} endAngle={-270}
                            >
                                <RadialBar background dataKey="value" cornerRadius={10} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="radial-center-label">
                            <div className="big">{completionRate.toFixed(0)}%</div>
                            <div className="small">hoan thanh</div>
                        </div>
                        <div className="radial-legend">
                            <span><i className="dot" style={{ background: PALETTE.success }}></i> Hoan thanh</span>
                            <span><i className="dot" style={{ background: PALETTE.danger }}></i> Huy ({cancelRate}%)</span>
                        </div>
                    </div>
                </div>

                <div className="chart-row two-cols">
                    <div className="chart-card">
                        <div className="card-head">
                            <div>
                                <h3>Top 5 bac si doanh thu</h3>
                                <span className="card-subtitle">Thang hien tai</span>
                            </div>
                        </div>
                        {dataDoctors.length === 0 ? (
                            <div className="empty-chart">Chua co du lieu</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={dataDoctors} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" horizontal={false} />
                                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7b85a1' }}
                                        tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v} />
                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120}
                                        tick={{ fontSize: 12, fill: '#333' }} />
                                    <Tooltip content={<CustomTooltip isCurrency />} />
                                    <Bar dataKey="revenue" name="Doanh thu" radius={[0, 8, 8, 0]}>
                                        {dataDoctors.map((_, i) => (
                                            <Cell key={i} fill={SPECIALTY_COLORS[i % SPECIALTY_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="chart-card">
                        <div className="card-head">
                            <div>
                                <h3>Kham theo chuyen khoa</h3>
                                <span className="card-subtitle">Phan bo tong so</span>
                            </div>
                        </div>
                        {dataSpecialty.length === 0 ? (
                            <div className="empty-chart">Chua co du lieu chuyen khoa</div>
                        ) : (
                            <div className="donut-wrap">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={dataSpecialty}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={95}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {dataSpecialty.map((_, i) => (
                                                <Cell key={i} fill={SPECIALTY_COLORS[i % SPECIALTY_COLORS.length]} stroke="#fff" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="donut-legend">
                                    {dataSpecialty.map((s, i) => (
                                        <div key={i} className="lg-item">
                                            <i className="dot" style={{ background: SPECIALTY_COLORS[i % SPECIALTY_COLORS.length] }}></i>
                                            <span className="lg-name">{s.name}</span>
                                            <span className="lg-val">{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart-card full">
                        <div className="card-head">
                            <div>
                                <h3>Luong kham theo thang</h3>
                                <span className="card-subtitle">Tong / Da kham / Da huy</span>
                            </div>
                            <select className="year-picker" value={selectedYear} onChange={this.handleChangeYear}>
                                {yearOptions.map(y => (
                                    <option key={y} value={y}>Nam {y}</option>
                                ))}
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={320}>
                            <ComposedChart data={dataMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={PALETTE.primary} stopOpacity={0.2} />
                                        <stop offset="100%" stopColor={PALETTE.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#7b85a1' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7b85a1' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="total" name="Tong" stroke={PALETTE.primary}
                                    strokeWidth={2} fill="url(#totalGrad)" />
                                <Bar dataKey="done" name="Da kham" fill={PALETTE.success} radius={[6, 6, 0, 0]} barSize={14} />
                                <Bar dataKey="cancelled" name="Da huy" fill={PALETTE.danger} radius={[6, 6, 0, 0]} barSize={14} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
