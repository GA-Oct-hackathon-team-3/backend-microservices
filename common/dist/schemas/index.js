"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giftSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.giftSchema = new mongoose_1.default.Schema({
    _id: mongoose_1.default.Schema.Types.ObjectId,
    title: String,
    image: String,
    reason: String,
    imageSearchQuery: String,
    giftType: String,
    estimatedCost: String,
});
