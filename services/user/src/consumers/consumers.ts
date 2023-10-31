import { Channel } from "amqplib";
import { getChannel } from "../utilities/config-amqp";
import { GenericBackoff } from "@cango91/presently-common/dist/functions/generic-backoff";
import { consumeUserCreated } from "./consume-user-created";
import { consumeUpdateProfile } from "./consume-update-profile";

const MAX_BACKOFF = 60000; // 60 seconds

let channel: Channel;
const qUserCreation = "user.created";
const qUpdateUserProfile = "user.update-profile";

async function bindQueues() {
    await GenericBackoff(_bindQueues, 1000, MAX_BACKOFF, "User events exchange not ready");
}

async function _bindQueues() {
    channel = getChannel();
    await channel.assertQueue(qUserCreation, { durable: true });
    await channel.assertQueue(qUpdateUserProfile, { durable: true });
    await channel.bindQueue(qUserCreation, 'user-events', qUserCreation);
    await channel.bindQueue(qUpdateUserProfile, 'user-events', qUpdateUserProfile);
}

export async function startConsuming() {
    await bindQueues();
    console.log("Queues bound");
    await consumeUserCreated(channel, qUserCreation);
    await consumeUpdateProfile(channel, qUpdateUserProfile);
}