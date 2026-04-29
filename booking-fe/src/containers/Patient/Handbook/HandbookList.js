import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import HomeHeader from '../../HomePage/HomeHeader';
import HomeFooter from '../../HomePage/HomeFooter';
import { getAllHandBook } from '../../../services/userService';

class HandbookList extends Component {
    state = { items: [], loading: false, q: '', activeTag: '' };

    componentDidMount() { this.load(); }

    load = async () => {
        this.setState({ loading: true });
        try {
            const res = await getAllHandBook({ q: this.state.q, tag: this.state.activeTag, limit: 60 });
            if (res && res.errCode === 0) this.setState({ items: res.data || [] });
        } catch (e) { }
        this.setState({ loading: false });
    };

    onSearch = () => this.load();

    getAllTags = () => {
        const set = new Set();
        this.state.items.forEach(i => {
            if (i.tags) String(i.tags).split(',').forEach(t => {
                const v = t.trim(); if (v) set.add(v);
            });
        });
        return Array.from(set).slice(0, 20);
    };

    toggleTag = (t) => this.setState({ activeTag: this.state.activeTag === t ? '' : t }, this.load);

    render() {
        const { items, loading, q, activeTag } = this.state;
        const tags = this.getAllTags();
        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="container" style={{ padding: '24px 16px' }}>
                    <h2 style={{ fontWeight: 700 }}>Cam nang y khoa</h2>

                    <div style={{
                        display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap'
                    }}>
                        <input
                            type="search"
                            className="form-control"
                            style={{ maxWidth: 360 }}
                            placeholder="Tim bai viet..."
                            value={q}
                            onChange={(e) => this.setState({ q: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') this.onSearch(); }}
                        />
                        <button className="btn btn-primary" onClick={this.onSearch}>
                            <i className="fas fa-search" aria-hidden="true"></i> Tim
                        </button>
                        {activeTag && (
                            <button className="btn btn-outline-secondary" onClick={() => this.toggleTag(activeTag)}>
                                Xoa tag "{activeTag}"
                            </button>
                        )}
                    </div>

                    {tags.length > 0 && (
                        <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, color: '#666', alignSelf: 'center' }}>Tags:</span>
                            {tags.map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => this.toggleTag(t)}
                                    style={{
                                        fontSize: 12,
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        border: '1px solid ' + (activeTag === t ? '#0d6efd' : '#e5e7eb'),
                                        background: activeTag === t ? '#0d6efd' : '#fff',
                                        color: activeTag === t ? '#fff' : '#333',
                                        cursor: 'pointer'
                                    }}
                                >#{t}</button>
                            ))}
                        </div>
                    )}

                    {loading && <div>Dang tai...</div>}
                    {!loading && items.length === 0 && <div className="text-muted">Khong co bai viet.</div>}

                    <div className="row">
                        {items.map(it => (
                            <div key={it.id} className="col-md-4 col-sm-6" style={{ marginBottom: 16 }}>
                                <div
                                    role="button" tabIndex={0}
                                    onClick={() => this.props.navigate(`/detail-handbook/${it.id}`)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') this.props.navigate(`/detail-handbook/${it.id}`); }}
                                    style={{
                                        border: '1px solid #e5e7eb', borderRadius: 8,
                                        overflow: 'hidden', cursor: 'pointer', height: '100%',
                                        background: '#fff'
                                    }}
                                >
                                    {it.image && (
                                        <img src={it.image} alt="" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                    )}
                                    <div style={{ padding: 12 }}>
                                        {it.category && (
                                            <div style={{ fontSize: 11, color: '#0d6efd', textTransform: 'uppercase' }}>
                                                {it.category}
                                            </div>
                                        )}
                                        <div style={{ fontWeight: 600, marginTop: 4 }}>{it.name}</div>
                                        {it.tags && (
                                            <div style={{ marginTop: 6, fontSize: 11, color: '#888' }}>
                                                {String(it.tags).split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                                                    <span key={t} style={{ marginRight: 6 }}>#{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapDispatchToProps = dispatch => ({ navigate: (p) => dispatch(push(p)) });
export default connect(null, mapDispatchToProps)(HandbookList);
