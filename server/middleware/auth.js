import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Force load .env file
dotenv.config();

console.log('Auth.js - JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('Auth.js - Secret length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

// Middleware to verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized. No token provided.' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('JWT Verify Error:', error.message);
        res.status(401).json({ 
            success: false, 
            message: 'Not authorized. Invalid token.' 
        });
    }
};

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin only.' 
        });
    }
    next();
};