import jwt from 'jsonwebtoken';

const getSecret = () => process.env.JWT_SECRET || 'booking-care-dev-secret-change-me';

export const signToken = (payload) => {
    return jwt.sign(payload, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const parseAuth = (req) => {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header) return null;
    const [scheme, token] = String(header).split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    try {
        return jwt.verify(token, getSecret());
    } catch (e) {
        return null;
    }
};

export const attachUser = (req, res, next) => {
    const decoded = parseAuth(req);
    if (decoded) req.user = decoded;
    next();
};

export const requireAuth = (req, res, next) => {
    const decoded = parseAuth(req);
    if (!decoded) {
        return res.status(401).json({ errCode: 401, errMessage: 'Unauthorized' });
    }
    req.user = decoded;
    next();
};

export const requireRole = (roles) => {
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        const decoded = parseAuth(req);
        if (!decoded) return res.status(401).json({ errCode: 401, errMessage: 'Unauthorized' });
        if (!allowed.includes(decoded.roleId)) {
            return res.status(403).json({ errCode: 403, errMessage: 'Forbidden' });
        }
        req.user = decoded;
        next();
    };
};

export default { signToken, attachUser, requireAuth, requireRole };
