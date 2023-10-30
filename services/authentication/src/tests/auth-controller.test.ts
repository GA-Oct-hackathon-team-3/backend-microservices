require('dotenv').config();
import mongoose from "mongoose";
import request from 'supertest';
import User from "../models/user";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { configureApp, app, server } from '../index';
import { closeRabbitMQ, initializeRabbitMQ, setKillSwitch } from "../utilities/config-amqp";
import client from "../utilities/config-redis";
import { createJwt, createRefreshToken } from "../utilities/token-service";


declare global {
    var __MONGO_URI__: string;
}

const { AUTH_SERVICE_SECRET } = process.env;

let accessToken: string, refreshToken: string;

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    await User.deleteMany({});
    await initializeRabbitMQ();
});

afterAll(async () => {
    await mongoose.connection.close();
    setKillSwitch(true);
    await closeRabbitMQ();
    await client.disconnect();
    server.close();

});

describe("Auth Controller", () => {

    describe("create()", () => {
        it("should create a new user with valid email and password", async () => {
            // Provide unique email and password
            // Expect a 201 status and valid tokens in response
            const response = await request(app)
                .post("/api/")
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "valid@email.com",
                    password: "strongPass1!"
                })
                .expect(201);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        it("should not create a user with an existing email", async () => {
            // Provide an already used email address
            // Expect an error response (exact status/message depends on User.create implementation)
            const response = await request(app)
                .post("/api/")
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "valid@email.com",
                    password: "strongPass2!"
                })
                .expect(500);
        });

    });


    describe("login()", () => {
        it("should log in with valid email and password", async () => {
            // Provide valid email and password
            // Expect a 200 status and valid tokens in response
            const response = await request(app)
                .post('/api/login')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "valid@email.com",
                    password: "strongPass1!"
                })
                .expect(200);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        it("should not log in with invalid email", async () => {
            // Provide non-existent email
            // Expect a 401 status with "Invalid credentials" message
            const response = await request(app)
                .post('/api/login')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "invalid@email.com",
                    password: "strongPass1!"
                })
                .expect(401);
            expect(response.body.accessToken).toBeUndefined();
            expect(response.body.refreshToken).toBeUndefined();
        });

        it("should not log in with invalid password", async () => {
            // Provide valid email but incorrect password
            // Expect a 401 status with "Invalid credentials" message
            const response = await request(app)
                .post('/api/login')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "valid@email.com",
                    password: "strongPass2!"
                })
                .expect(401);
            expect(response.body.accessToken).toBeUndefined();
            expect(response.body.refreshToken).toBeUndefined();
        });
    });

    describe("logout()", () => {
        it("should log out with a valid refresh token", async () => {
            // Provide a valid refresh token
            // Expect a 204 status and "Logged out" message
            const response = await request(app)
                .post('/api/logout')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({ accessToken, refreshToken })
                .expect(204);
        });

        it("should not log out with an invalid refresh token", async () => {
            // Provide an invalid/non-existent refresh token
            // Expect a 404 status with "Not found. Can't logout" message
            const response = await request(app)
                .post('/api/logout')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({ accessToken, refreshToken: "doesnotExist" })
                .expect(404);
        });
    });

    describe("refresh()", () => {
        it("should refresh tokens with valid accessToken and refreshToken", async () => {
            // Provide a valid accessToken and refreshToken
            // Expect a 200 status and new tokens in response
            // First login again since we logged out on previous tests
            const response = await request(app)
                .post('/api/login')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({
                    email: "valid@email.com",
                    password: "strongPass1!"
                })
                .expect(200);
            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
            const refreshResponse = await request(app)
                .post('/api/refresh')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({ accessToken, refreshToken })
                .expect(200)
            expect(refreshResponse.body.accessToken).toBeDefined();
            expect(refreshResponse.body.refreshToken).toBeDefined();
        });

        it("should not refresh tokens with invalid accessToken or refreshToken", async () => {
            // Provide either invalid accessToken or refreshToken
            // Expect a 400 status with error message
            const response = await request(app)
                .post('/api/refresh')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({ accessToken: "token", refreshToken: "refresh" })
                .expect(500);
        });

        it("should not refresh tokens for a non-existent user", async () => {
            // Provide an accessToken of a user who does not exist in the database
            // Expect a 404 status with "Not found" message
            const invalidId = new mongoose.Types.ObjectId();
            const token = createJwt({ _id: invalidId });
            const refresh = createRefreshToken({ _id: invalidId });
            const response = await request(app)
                .post('/api/refresh')
                .set("x-service-secret", AUTH_SERVICE_SECRET!)
                .send({ accessToken: token, refreshToken: refresh })
                .expect(404);
        });
    });
});