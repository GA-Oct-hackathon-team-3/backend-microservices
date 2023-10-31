import { Channel, ConsumeMessage } from "amqplib";
import {v4 as uuid} from 'uuid';
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
                    bio: parsed.bio,
                    location: parsed.location
                }, {new:true, upsert: false});
                if(!user) throw new Error("User profile not found");
                console.log("User profile updated for: ", parsed._id);
                channel.ack(message);
                channel.publish('user-events', 'user-profile.updated', Buffer.from(JSON.stringify({_id: parsed._id})),{messageId: uuid()});
            } catch (error) {
                console.error(error);
                channel.nack(message, false, true);
            }
        }
    });
}