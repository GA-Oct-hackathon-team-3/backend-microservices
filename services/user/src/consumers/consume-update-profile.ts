import { Channel, ConsumeMessage } from "amqplib";
import User from "../models/user";

export async function consumeUpdateProfile(channel: Channel, key: string) {
    await channel.consume(key, async (message: ConsumeMessage | null) => {
        if (message) {
            try {
                const parsed = JSON.parse(message.content.toString());
                const user = await User.findOneAndUpdate({user:parsed._id},{
                    name: parsed.name,
                    dob: parsed.dob,
                    gender: parsed.gender,
                    tel: parsed.tel,
                    interests: parsed.interests,
                    photo: parsed.photo,
                    bio: parsed.bio
                }, {new:true, upsert: false});
                if(!user) throw new Error("User profile not found");
                console.log("User profile updated for: ", parsed._id);
                channel.ack(message);
            } catch (error) {
                console.error(error);
                channel.nack(message, false, true);
            }
        }
    });
}