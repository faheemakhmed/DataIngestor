"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHash = generateHash;
exports.generateRecordHash = generateRecordHash;
exports.isDuplicateHash = isDuplicateHash;
const crypto_1 = __importDefault(require("crypto"));
function generateHash(data) {
    const normalized = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto_1.default.createHash('sha256').update(normalized).digest('hex');
}
function generateRecordHash(sourceId, externalId, payload) {
    const content = `${sourceId}:${externalId}:${JSON.stringify(payload)}`;
    return generateHash(content);
}
function isDuplicateHash(hash) {
    return false;
}
//# sourceMappingURL=hash.js.map