import React, { Component } from 'react';
import { getNoShowStatsService } from '../../../services/userService';
import { exportToExcel } from '../../../utils/excelExport';
import './NoShowReport.scss';

class NoShowReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            startDate: '',
            endDate: ''
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        this.setState({ loading: true });
        try {
            const opts = {};
            if (this.state.startDate) opts.startDate = new Date(this.state.startDate).getTime();
            if (this.state.endDate) opts.endDate = new Date(this.state.endDate).getTime();
            const res = await getNoShowStatsService(opts);
            if (res && res.errCode === 0) {
                this.setState({ data: res.data || [], loading: false });
            } else {
                this.setState({ loading: false });
            }
        } catch (e) { this.setState({ loading: false }); }
    };

    handleExport = () => {
        exportToExcel(`no-show-report-${Date.now()}.xlsx`, this.state.data, [
            { key: 'doctorName', label: 'Bac si' },
            { key: 'total', label: 'Tong lich' },
            { key: 'completed', label: 'Hoan thanh' },
            { key: 'cancelled', label: 'Huy' },
            { key: 'noShow', label: 'Khong den' },
            { key: 'noShowRate', label: 'Ty le khong den (%)' },
            { key: 'cancelRate', label: 'Ty le huy (%)' }
        ]);
    };

    render() {
        const { data, loading, startDate, endDate } = this.state;
        const totals = data.reduce((a, r) => ({
            total: a.total + r.total,
            noShow: a.noShow + r.noShow,
            cancelled: a.cancelled + r.cancelled,
            completed: a.completed + r.completed
        }), { total: 0, noShow: 0, cancelled: 0, completed: 0 });
        const overallNoShowRate = totals.total ? (totals.noShow / totals.total * 100).toFixed(2) : 0;
        return (
            <div className="no-show-report container">
                <h2>Bao cao khong den / huy lich</h2>

                <div className="filters">
                    <label>Tu ngay</label>
                    <input type="date" value={startDate}
                        onChange={e => this.setState({ startDate: e.target.value })} />
                    <label>Den ngay</label>
                    <input type="date" value={endDate}
                        onChange={e => this.setState({ endDate: e.target.value })} />
                    <button className="btn btn-primary" onClick={this.load}>Loc</button>
                    {data.length > 0 && (
                        <button className="btn btn-outline-success" onClick={this.handleExport}>
                            <i className="fas fa-file-excel"></i> Excel
                        </button>
                    )}
                </div>

                <div className="kpi-row">
                    <div className="kpi">
                        <div className="label">Tong lich</div>
                        <div className="num">{totals.total}</div>
                    </div>
                    <div className="kpi green">
                        <div className="label">Hoan thanh</div>
                        <div className="num">{totals.completed}</div>
                    </div>
                    <div className="kpi orange">
                        <div className="label">Huy</div>
                        <div className="num">{totals.cancelled}</div>
                    </div>
                    <div className="kpi red">
                        <div className="label">Khong den</div>
                        <div className="num">{totals.noShow}</div>
                        <div className="sub">{overallNoShowRate}%</div>
                    </div>
                </div>

                {loading ? <div className="loading">Dang tai...</div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Bac si</th>
                                    <th>Tong</th>
                                    <th>Hoan thanh</th>
                                    <th>Huy</th>
                                    <th>Khong den</th>
                                    <th>Ty le khong den</th>
                                    <th>Ty le huy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan="7" className="empty">Khong co du lieu</td></tr>
                                ) : data.map(r => (
                                    <tr key={r.doctorId}>
                                        <td>{r.doctorName || `#${r.doctorId}`}</td>
                                        <td>{r.total}</td>
                                        <td>{r.completed}</td>
                                        <td>{r.cancelled}</td>
                                        <td className={r.noShowRate > 20 ? 'bad' : ''}>{r.noShow}</td>
                                        <td className={r.noShowRate > 20 ? 'bad' : ''}>{r.noShowRate}%</td>
                                        <td>{r.cancelRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
}

export default NoShowReport;
