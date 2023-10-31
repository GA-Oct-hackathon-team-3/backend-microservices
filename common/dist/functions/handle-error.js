"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const send_error_1 = require("./send-error");
function handleError(res, error) {
    if ('status' in error && 'message' in error) {
        (0, send_error_1.sendError)(res, error);
    }
    else {
        return res.status(500).json({ message: error.message });
    }
}
exports.default = handleError;
