import { Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AUTH_SERVICE_URL, USER_SERVICE_URL } from '@cango91/presently-common/dist/constants';
import { sendServiceRequest } from '@cango91/presently-common/dist/functions/send-service-request';
import { sendError } from '@cango91/presently-common/dist/functions/send-error';
import { HTTPError } from "@cango91/presently-common/dist/types";
import { getChannel } from "../utilities/config-amqp";
import { IExtReq } from "../middleware/bearer";

const { AUTH_SERVICE_SECRET, USER_SERVICE_SECRET } = process.env;

/* USER AUTHENTICATION */

export async function signup(req: Request, res: Response) {
    try {
        const { email, password, name, tel, dob, gender, photo, location } = req.body;
        const response = await sendServiceRequest(
            `${AUTH_SERVICE_URL}/api`,
            AUTH_SERVICE_SECRET!,
            "POST",
            {
                email,
                password
            });
        if (response.ok) {
            const { accessToken, refreshToken } = await response.json();
            const channel = getChannel();
            const decoded = jwt.decode(accessToken) as JwtPayload;
            const userId = decoded.payload._id;
            const msg = {
                _id: userId,
                name,
                tel,
                dob,
                gender,
                photo,
                location,
            };
            channel.publish("user-events", "user.update-profile", Buffer.from(JSON.stringify(msg)));
            res.cookie("refreshToken", refreshToken, { signed: true, httpOnly: true });
            res.status(200).json({ accessToken });
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/login`, AUTH_SERVICE_SECRET!, "POST", {
            email,
            password
        });
        if (response.ok) {
            const { accessToken, refreshToken } = await response.json();
            res.cookie("refreshToken", refreshToken, { signed: true, httpOnly: true });
            res.status(200).json({ accessToken });
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export async function logout(req: Request, res: Response) {
    try {
        let refreshToken = req.signedCookies["refreshToken"];
        const response = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/logout`, AUTH_SERVICE_SECRET!, "POST", { refreshToken });
        if (response.ok) {
            res.clearCookie('refreshToken');
            res.status(200).json({ message: "Logged out" });
        } else {
            throw { status: 400, message: "Bad request" };
        }
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/* END USER AUTHENTICATION */

/* USER PROFILE */

export async function getUserProfile(req: Request & IExtReq, res: Response) {
    try {
        const profileResponse = await sendServiceRequest(`${USER_SERVICE_URL}/api/${req.user}`, USER_SERVICE_SECRET!);
        if (profileResponse.ok) {
            const verificationResponse = await sendServiceRequest(`${AUTH_SERVICE_URL}/api/${req.user}/is-verified`, AUTH_SERVICE_SECRET!);
            if (verificationResponse.ok) {
                const response = {
                    ...await profileResponse.json(),
                    ...await verificationResponse.json()
                };
                res.status(200).json(response);
            } else {
                throw { status: 400, message: (await verificationResponse.json()).message }
            }
        } else {
            throw { status: 400, message: (await profileResponse.json()).message }
        }
    } catch (error: any) {
        if ('status' in error && 'message' in error) {
            sendError(res, error as HTTPError);
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/* END USER PROFILE */