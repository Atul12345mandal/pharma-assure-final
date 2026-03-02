const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        req.user = {
            id: decoded.userId,
            company_id: decoded.companyId || 1,
            role: decoded.role || 'admin'
        };
        
        console.log('✅ Auth middleware - User authenticated:', req.user.id);
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.message);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
};

module.exports = { authenticate, authorize };