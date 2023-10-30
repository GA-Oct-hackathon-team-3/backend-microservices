"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = void 0;
function sendError(res, { status, message }) {
    res.status(status).json({ message });
}
exports.sendError = sendError;
