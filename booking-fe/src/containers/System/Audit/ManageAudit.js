import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import DatePicker from '../../../components/Input/DatePicker';
import { getAuditLogsService } from '../../../services/userService';
import { exportToExcel } from '../../../utils/excelExport';
import './ManageAudit.scss';

const ACTION_OPTIONS = [
    { value: '', label: '-- Tat ca hanh dong --' },
    { value: 'user.login', label: 'Dang nhap' },
    { value: 'user.verifyMfa', label: 'Xac thuc MFA' },
    { value: 'user.create', label: 'Tao nguoi dung' },
    { value: 'user.edit', label: 'Sua nguoi dung' },
    { value: 'user.delete', label: 'Xoa nguoi dung' },
    { value: 'payment.refund', label: 'Hoan tien' }
];

const prettyRole = (r) => {
    if (r === 'R1') return 'Admin';
    if (r === 'R2') return 'Bac si';
    if (r === 'R3') return 'Benh nhan';
    return r || '-';
};

const statusBadge = (s) => {
    if (s >= 200 && s < 300) return 'ok';
    if (s >= 400 && s < 500) return 'warn';
    if (s >= 500) return 'err';
    return '';
};

class ManageAudit extends Component {
    state = {
        rows: [],
        loading: false,
        action: '',
        userId: '',
        useDateRange: false,
        from: moment().subtract(7, 'days').startOf('day').valueOf(),
        to: moment().endOf('day').valueOf(),
        limit: 200,
        expanded: {}
    };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const { action, userId, useDateRange, from, to, limit } = this.state;
            const opts = { limit };
            if (action) opts.action = action;
            if (userId) opts.userId = userId;
            if (useDateRange) {
                opts.from = from;
                opts.to = to;
            }
            const res = await getAuditLogsService(opts);
            if (res && res.errCode === 0) {
                this.setState({ rows: res.data || [] });
            } else {
                this.setState({ rows: [] });
            }
        } catch (e) {
            this.setState({ rows: [] });
        } finally {
            this.setState({ loading: false });
        }
    };

    toggleExpand = (id) => {
        this.setState(prev => ({
            expanded: { ...prev.expanded, [id]: !prev.expanded[id] }
        }));
    };

    handleExport = () => {
        const cols = [
            { key: 'createdAt', label: 'Thoi gian', get: r => r.createdAt ? moment(r.createdAt).format('DD/MM/YYYY HH:mm:ss') : '' },
            { key: 'action', label: 'Hanh dong' },
            { key: 'userId', label: 'User ID' },
            { key: 'roleId', label: 'Vai tro', get: r => prettyRole(r.roleId) },
            { key: 'method', label: 'Method' },
            { key: 'path', label: 'Path' },
            { key: 'ip', label: 'IP' },
            { key: 'statusCode', label: 'Status' },
            { key: 'metadata', label: 'Metadata' }
        ];
        exportToExcel(`audit-log-${moment().format('DDMMYYYY-HHmm')}.xlsx`, this.state.rows, cols);
    };

    formatMetadata = (meta) => {
        if (!meta) return '';
        try {
            const obj = typeof meta === 'string' ? JSON.parse(meta) : meta;
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(meta);
        }
    };

    render() {
        const { rows, loading, action, userId, useDateRange, from, to, limit, expanded } = this.state;

        return (
            <div className="manage-audit">
                <div className="ma-title">Nhat ky kiem toan (Audit log)</div>

                <div className="ma-filter">
                    <div className="fg">
                        <label>Hanh dong</label>
                        <select value={action} onChange={e => this.setState({ action: e.target.value })}>
                            {ACTION_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fg">
                        <label>User ID</label>
                        <input type="number" value={userId}
                            placeholder="VD: 15"
                            onChange={e => this.setState({ userId: e.target.value })} />
                    </div>

                    <div className="fg range-toggle">
                        <label>
                            <input type="checkbox" checked={useDateRange}
                                onChange={e => this.setState({ useDateRange: e.target.checked })} />
                            Loc theo khoang ngay
                        </label>
                    </div>

                    {useDateRange && (
                        <>
                            <div className="fg">
                                <label>Tu ngay</label>
                                <DatePicker value={from}
                                    onChange={d => this.setState({ from: moment(d[0]).startOf('day').valueOf() })} />
                            </div>
                            <div className="fg">
                                <label>Den ngay</label>
                                <DatePicker value={to}
                                    onChange={d => this.setState({ to: moment(d[0]).endOf('day').valueOf() })} />
                            </div>
                        </>
                    )}

                    <div className="fg">
                        <label>Gioi han</label>
                        <select value={limit} onChange={e => this.setState({ limit: Number(e.target.value) })}>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                            <option value={500}>500</option>
                        </select>
                    </div>

                    <div className="fg actions">
                        <button className="btn btn-primary" onClick={this.load} disabled={loading}>
                            <i className="fas fa-search"></i> Tim
                        </button>
                        <button className="btn btn-success" onClick={this.handleExport} disabled={!rows.length}>
                            <i className="fas fa-file-excel"></i> Xuat Excel
                        </button>
                    </div>
                </div>

                <div className="ma-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 150 }}>Thoi gian</th>
                                <th style={{ width: 130 }}>Hanh dong</th>
                                <th style={{ width: 90 }}>User</th>
                                <th style={{ width: 80 }}>Vai tro</th>
                                <th style={{ width: 60 }}>Method</th>
                                <th>Path</th>
                                <th style={{ width: 130 }}>IP</th>
                                <th style={{ width: 70 }}>Status</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan="9" className="empty">Dang tai...</td></tr>
                            )}
                            {!loading && rows.length === 0 && (
                                <tr><td colSpan="9" className="empty">Khong co nhat ky nao</td></tr>
                            )}
                            {!loading && rows.map(r => (
                                <React.Fragment key={r.id}>
                                    <tr>
                                        <td>{r.createdAt ? moment(r.createdAt).format('DD/MM/YY HH:mm:ss') : '-'}</td>
                                        <td><span className="action-chip">{r.action || '-'}</span></td>
                                        <td>{r.userId || '-'}</td>
                                        <td>{prettyRole(r.roleId)}</td>
                                        <td><span className={`method-tag m-${(r.method || '').toLowerCase()}`}>{r.method || '-'}</span></td>
                                        <td className="path-col" title={r.path}>{r.path || '-'}</td>
                                        <td>{r.ip || '-'}</td>
                                        <td><span className={`status-badge ${statusBadge(r.statusCode)}`}>{r.statusCode || '-'}</span></td>
                                        <td>
                                            <button className="btn-expand" onClick={() => this.toggleExpand(r.id)}
                                                title="Xem chi tiet">
                                                <i className={`fas fa-chevron-${expanded[r.id] ? 'up' : 'down'}`}></i>
                                            </button>
                                        </td>
                                    </tr>
                                    {expanded[r.id] && (
                                        <tr className="detail-row">
                                            <td colSpan="9">
                                                <div className="detail-grid">
                                                    <div><b>User-Agent:</b> <span className="mono">{r.ua || '-'}</span></div>
                                                    <div><b>Metadata:</b>
                                                        <pre className="meta-pre">{this.formatMetadata(r.metadata) || '(trong)'}</pre>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="ma-footer">Tong: {rows.length} ban ghi</div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    userInfo: state.user.userInfo
});

export default connect(mapStateToProps)(ManageAudit);
