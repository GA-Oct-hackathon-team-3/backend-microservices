import mongoose from "mongoose";
import { giftSchema } from '@cango91/presently-common/dist/schemas';
import { GIFT_PREFERENCES } from "../utilities/constants";


const friendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        maxLength: 30,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["female", "male", "other"],
        required: true,
    },
    location: {
        type: String,
        maxLength: 30,
        trim: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    photo: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        maxLength: 200,
        trim: true,
    },
    interests: {
        type: [String],
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    giftPreferences: {
        type: [String],
        validate: {
            validator: function (value: string[]) {
                return value.every(v => GIFT_PREFERENCES.includes(v.toLowerCase()));
            },
            message: "Invalid gift type."
        }
    },
    favorites: [giftSchema]
},
    {
        timestamps: true,
        toJSON: {
            transform: function (_, ret) {
                if (ret.dob instanceof Date) {
                    ret.dob = ret.dob.toISOString().split('T')[0]; // Format date as 'yyyy-mm-dd'
                }
            }
        }

    });

// validation for DOB input
friendSchema.pre('save', function (next) {
    const now = new Date();
    if (this.dob > now) {
        const error = new Error('Date of birth cannot be in the future');
        return next(error);
    }
    next();
});

export default mongoose.model("Friend", friendSchema);