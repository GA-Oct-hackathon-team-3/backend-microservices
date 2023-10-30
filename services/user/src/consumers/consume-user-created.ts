import { Channel, ConsumeMessage } from "amqplib";
import User from "../models/user";

export async function consumeUserCreated(channel: Channel, key: string) {
    await channel.consume(key, async (message: ConsumeMessage | null) => {
        if (message) {
            try {
                const parsed = JSON.parse(message.content.toString());
                await User.create({
                    user: parsed._id
                });
                console.log("Empty user created for:", parsed._id);
                channel.ack(message);
            } catch (error) {
                console.error(error);
                channel.nack(message, false, true);
            }
        }
    });
}