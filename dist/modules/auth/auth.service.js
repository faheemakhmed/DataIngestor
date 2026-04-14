"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.validateUser = validateUser;
exports.getUserById = getUserById;
const prisma_1 = __importDefault(require("@/lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createUser(data) {
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.default.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
        },
    });
}
async function validateUser(email, password) {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid)
        return null;
    return { id: user.id, email: user.email, name: user.name };
}
async function getUserById(id) {
    return prisma_1.default.user.findUnique({ where: { id } });
}
//# sourceMappingURL=auth.service.js.map