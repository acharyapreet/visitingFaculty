const jwt = require('jsonwebtoken');
const { User } = require('../Schema');

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Get token from header
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please provide a valid token.'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user
            const user = await User.findOne({
                where: { 
                    user_id: decoded.user_id,
                    is_active: true 
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or account is inactive'
                });
            }

            // Check if user is approved
            if (!user.is_approved) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is pending approval'
                });
            }

            // Check role permissions
            if (roles.length > 0 && !roles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions. Access denied.'
                });
            }

            // Attach user to request
            req.user = user;
            req.user_id = user.user_id;
            next();
            
        } catch (error) {
            console.error('Auth Error:', error);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please login again.'
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Authentication failed',
                error: error.message
            });
        }
    };
};
module.exports = authMiddleware;