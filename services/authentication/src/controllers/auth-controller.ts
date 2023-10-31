import { Request, Response } from "express";
import { sendError } from '@cango91/presently-common/dist/functions/send-error';
import { HTTPError } from '@cango91/presently-common/dist/types'
import { toSeconds } from "@cango91/presently-common/dist/functions/to-seconds";
import mongoose from "mongoose";
import { v4 as uuid } from 'uuid';
import redisClient from '../utilities/config-redis';
import * as tokenService from '../utilities/token-service';
import RefreshToken from '../models/refresh-token';
import User, { IUserDocument } from "../models/user";
import { getChannel } from "../utilities/config-amqp";
import { createAndCacheTokenForUser } from "../utilities/verification-service";

const { AUTH_JWT_EXPIRE } = process.env;

/* USER AUTHENTICATION */

/**
 * Verifies user's password against stored hash. Generates accessToken and refreshToken if valid
 */
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user: IUserDocument | null = await User.findOne({ email });
        if (user && await user.checkPassword(password)) {
            const userId = user._id;
            const response = await handleTokens(userId);
            return res.status(200).json(response);
        } else {
            throw { status: 401, message: "Invalid credentials" };
        }
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * Creates a new user and publishes email verification token and user created event messages to the message queue
 */
export async function create(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await User.create({
            email,
            password,
        });

        const channel = getChannel();

        channel.publish('user-events', 'user.created', Buffer.from(JSON.stringify({ _id: user._id })), { messageId: uuid() });

        const verification = await createAndCacheTokenForUser(user._id);

        const messagePayload = {
            token: verification.token,
            email: user.email
        }
        channel.publish('auth-exchange', 'auth.token', Buffer.from(JSON.stringify(messagePayload)), { messageId: uuid() });
        const response = await handleTokens(user._id);
        res.status(201).json(response);
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * Revokes the user's refresh token
 */
export async function logout(req: Request, res: Response) {
    try {
        const { refreshToken } = req.body;
        const tk = await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true }, { new: true, upsert: false });
        if (!tk) throw { status: 404, message: "Not found. Can't logout" };
        await redisClient.del(`refresh:${refreshToken}`);
        res.status(204).json({ message: "Logged out" });
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}


/**
 * creates a pair of accessToken and refreshToken and returns them. Caches the refreshToken in redis.
 */
async function handleTokens(userId: string | mongoose.Types.ObjectId): Promise<{ accessToken: string, refreshToken: string }> {
    userId = userId instanceof mongoose.Types.ObjectId ? userId : new mongoose.Types.ObjectId(userId);
    const accessToken = tokenService.createJwt({ _id: userId });
    const refreshToken = tokenService.createRefreshToken({ _id: userId });
    const wholeToken = await RefreshToken.findOneAndUpdate({ token: refreshToken }, {
        token: refreshToken,
        expires: new Date(tokenService.parseJwt(refreshToken).exp * 1000),
        user: userId
    }, {
        upsert: true,
        new: true,
    });
    await (redisClient.set as any)(`refresh:${userId}`, JSON.stringify(wholeToken), 'EX', toSeconds(AUTH_JWT_EXPIRE!)! * 2);
    return { accessToken, refreshToken };
}

/**
 * Refreshes accessToken and rotates refreshToken. Idempotent within 60 seconds.
 */
export async function refresh(req: Request, res: Response) {
    try {
        const { accessToken, refreshToken } = req.body;
        if (!accessToken || !refreshToken) throw { status: 400, message: "Missing credentials" };
        const foundUser = await User.findById(tokenService.parseJwt(accessToken).payload._id);
        if (!foundUser) throw { status: 404, message: "Not found" };
        const newTokens = await tokenService.refreshTokens(accessToken, refreshToken);
        res.status(200).json({ accessToken: newTokens?.accessToken, refreshToken: newTokens?.refreshToken });
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * Returns whether a user's email is verified
 */
export async function isVerified(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) throw { status: 404, message: "User not found" };
        res.status(200).json({ isVerified: user.emailVerified });
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/* END USER AUTHENTICATION */

/* EMAIL VERIFICATION */



/* END EMAIL VERIFICATION */