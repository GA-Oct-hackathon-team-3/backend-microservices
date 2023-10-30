"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendServiceRequest = void 0;
function sendServiceRequest(url, serviceSecret, method = "GET", payload) {
    const options = {
        method,
        headers: {
            "x-service-secret": serviceSecret,
            "Content-Type": "application/json"
        },
    };
    if (payload) {
        options.body = JSON.stringify(payload);
    }
    return fetch(url, options);
}
exports.sendServiceRequest = sendServiceRequest;
