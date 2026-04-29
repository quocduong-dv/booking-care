import React, { Component } from 'react';

const STORAGE_KEY = 'bookingcare_cookie_consent_v1';

class CookieConsent extends Component {
    state = { visible: false };

    componentDidMount() {
        try {
            if (!localStorage.getItem(STORAGE_KEY)) {
                this.setState({ visible: true });
            }
        } catch (e) { }
    }

    save = (value) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() })); } catch (e) { }
        this.setState({ visible: false });
    };

    render() {
        if (!this.state.visible) return null;
        return (
            <div style={styles.wrap} role="dialog" aria-label="Cookie consent">
                <div style={styles.text}>
                    Chung toi su dung cookie de cai thien trai nghiem, phan tich truy cap va ho tro dang nhap.
                    Bang viec tiep tuc, ban dong y voi{' '}
                    <a href="/detail-terms-of-use" style={styles.link}>Dieu khoan</a> va{' '}
                    <a href="/detail-terms-of-use" style={styles.link}>Chinh sach cookie</a>.
                </div>
                <div style={styles.btns}>
                    <button style={styles.btnGhost} onClick={() => this.save('essential')}>Chi cookie can thiet</button>
                    <button style={styles.btnPrimary} onClick={() => this.save('all')}>Dong y tat ca</button>
                </div>
            </div>
        );
    }
}

const styles = {
    wrap: {
        position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999,
        background: '#0d1b2a', color: '#fff', padding: '14px 18px',
        borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: 14, fontSize: 14, maxWidth: 1100, margin: '0 auto'
    },
    text: { flex: '1 1 320px', lineHeight: 1.5 },
    link: { color: '#7dd3fc', textDecoration: 'underline' },
    btns: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    btnGhost: {
        padding: '8px 14px', background: 'transparent', color: '#fff',
        border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, cursor: 'pointer'
    },
    btnPrimary: {
        padding: '8px 14px', background: '#0d6efd', color: '#fff',
        border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600
    }
};

export default CookieConsent;
