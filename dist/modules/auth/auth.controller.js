"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
const auth_middleware_1 = require("./auth.middleware");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
class AuthController {
    async register(req, res, next) {
        try {
            const data = registerSchema.parse(req.body);
            const user = await (0, auth_service_1.createUser)(data);
            const token = (0, auth_middleware_1.generateToken)(user.id, user.email);
            res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const data = loginSchema.parse(req.body);
            const user = await (0, auth_service_1.validateUser)(data.email, data.password);
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            const token = (0, auth_middleware_1.generateToken)(user.id, user.email);
            res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map