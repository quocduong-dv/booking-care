import db from '../models/index';

const SENSITIVE_KEYS = ['password', 'token', 'mfaOtpCode', 'otp', 'code'];

const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const k of Object.keys(out)) {
        if (SENSITIVE_KEYS.includes(k)) out[k] = '***';
        else if (typeof out[k] === 'object' && out[k] !== null) out[k] = sanitize(out[k]);
    }
    return out;
};

const ipFrom = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || req.socket?.remoteAddress
        || 'unknown';
};

export const auditLog = (actionName) => {
    return (req, res, next) => {
        const started = Date.now();
        const origJson = res.json.bind(res);
        res.json = (body) => {
            try {
                const metadata = {
                    body: sanitize(req.body || {}),
                    query: sanitize(req.query || {}),
                    durationMs: Date.now() - started,
                    errCode: body?.errCode
                };
                db.AuditLog.create({
                    userId: req.user?.id || null,
                    roleId: req.user?.roleId || null,
                    action: actionName,
                    method: req.method,
                    path: req.originalUrl?.slice(0, 250),
                    ip: ipFrom(req),
                    ua: (req.headers['user-agent'] || '').slice(0, 250),
                    statusCode: res.statusCode,
                    metadata: JSON.stringify(metadata).slice(0, 8000)
                }).catch(e => console.log('[audit] write fail:', e.message));
            } catch (e) { }
            return origJson(body);
        };
        next();
    };
};

export default { auditLog };
