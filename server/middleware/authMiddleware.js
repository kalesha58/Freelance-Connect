const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            User.findById(decoded.id).select('-password').then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'Not authorized, user not found' });
                }
                req.user = user;
                next();
            }).catch(err => {
                console.error('Auth Middleware Find Error:', err.message);
                res.status(401).json({ message: 'Not authorized' });
            });
            return; // Exit protect and wait for promise
        } catch (error) {
            console.error('Auth Middleware Verify Error:', error.message);
            return res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Attaches req.user when a valid Bearer token is present; otherwise req.user stays undefined.
 * Use for routes that work for guests but can enrich data for logged-in users.
 */
const optionalAuth = (req, res, next) => {
    req.user = null;
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decoded.id)
            .select('-password')
            .then((user) => {
                if (user) req.user = user;
                next();
            })
            .catch(() => next());
    } catch {
        next();
    }
};

module.exports = { protect, optionalAuth };
