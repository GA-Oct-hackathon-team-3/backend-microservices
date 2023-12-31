"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSeconds = void 0;
function toSeconds(timeString) {
    const validUnits = ['s', 'm', 'h', 'd', 'w'];
    const unit = timeString.substring(timeString.length - 1);
    if (!validUnits.includes(unit))
        throw new Error('Invalid time unit');
    const num = Number(timeString.substring(0, timeString.length - 1));
    if (isNaN(num)) {
        throw new Error('Invalid number in time string');
    }
    // convert time unit to seconds
    switch (unit) {
        case 's':
            return num;
        case 'm':
            return num * 60;
        case 'h':
            return num * 3600;
        case 'd':
            return num * 86400;
        case 'w':
            return num * 604800;
    }
}
exports.toSeconds = toSeconds;
