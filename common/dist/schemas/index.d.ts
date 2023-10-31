import mongoose from "mongoose";
export declare const giftSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    _id?: mongoose.Types.ObjectId | null | undefined;
    title?: string | null | undefined;
    image?: string | null | undefined;
    reason?: string | null | undefined;
    imageSearchQuery?: string | null | undefined;
    giftType?: string | null | undefined;
    estimatedCost?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    _id?: mongoose.Types.ObjectId | null | undefined;
    title?: string | null | undefined;
    image?: string | null | undefined;
    reason?: string | null | undefined;
    imageSearchQuery?: string | null | undefined;
    giftType?: string | null | undefined;
    estimatedCost?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    _id?: mongoose.Types.ObjectId | null | undefined;
    title?: string | null | undefined;
    image?: string | null | undefined;
    reason?: string | null | undefined;
    imageSearchQuery?: string | null | undefined;
    giftType?: string | null | undefined;
    estimatedCost?: string | null | undefined;
}> & Required<{
    _id: mongoose.Types.ObjectId | null;
}>>;
