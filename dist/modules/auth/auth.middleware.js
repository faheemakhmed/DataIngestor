"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("@/lib/config"));
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function generateToken(userId, email) {
    return jsonwebtoken_1.default.sign({ id: userId, email }, config_1.default.jwtSecret, { expiresIn: '24h' });
}
//# sourceMappingURL=auth.middleware.js.map