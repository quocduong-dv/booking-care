const buckets = new Map();

const CLEAN_EVERY = 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of buckets.entries()) {
        if (now - data.start > data.windowMs) buckets.delete(key);
    }
}, CLEAN_EVERY).unref?.();

const ipFrom = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
        || req.socket?.remoteAddress
        || req.connection?.remoteAddress
        || 'unknown';
};

export const rateLimit = ({ windowMs = 60 * 1000, max = 60, keyFn, name = 'generic' } = {}) => {
    return (req, res, next) => {
        const k = `${name}:${keyFn ? keyFn(req) : ipFrom(req)}`;
        const now = Date.now();
        const entry = buckets.get(k);
        if (!entry || now - entry.start > windowMs) {
            buckets.set(k, { start: now, windowMs, count: 1 });
            return next();
        }
        entry.count++;
        if (entry.count > max) {
            res.set('Retry-After', Math.ceil((entry.start + windowMs - now) / 1000));
            return res.status(429).json({
                errCode: 429,
                errMessage: 'Qua nhieu yeu cau. Vui long thu lai sau.'
            });
        }
        next();
    };
};

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    name: 'login',
    keyFn: (req) => `${ipFrom(req)}:${req.body?.email || ''}`
});

export const otpLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    name: 'otp',
    keyFn: (req) => `${ipFrom(req)}:${req.body?.email || req.body?.userId || ''}`
});

export const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    name: 'write'
});

export default { rateLimit, loginLimiter, otpLimiter, writeLimiter };
