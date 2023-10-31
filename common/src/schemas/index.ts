import mongoose from "mongoose";

export const giftSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    image: String,
    reason: String,
    imageSearchQuery: String,
    giftType: String,
    estimatedCost: String,
});