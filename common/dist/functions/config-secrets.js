"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SECRETS_PATH = process.env.SECRETS_PATH || '/run/secrets/';
const loadSecrets = () => {
    const secrets = fs_1.default.readdirSync(SECRETS_PATH);
    secrets.forEach((secret) => {
        const secretValue = fs_1.default.readFileSync(path_1.default.join(SECRETS_PATH, secret), 'utf8').trim();
        process.env[secret] = secretValue;
    });
};
const loadDockerSecrets = () => {
    const secretsPath = '/run/secrets/';
    const secrets = fs_1.default.readdirSync(secretsPath);
    secrets.forEach((secret) => {
        const secretValue = fs_1.default.readFileSync(path_1.default.join(secretsPath, secret), 'utf8').trim();
        process.env[secret] = secretValue;
    });
};
exports.default = () => {
    if (process.env.KUBERNETES) {
        loadSecrets();
    }
    else if (process.env.DOCKER) {
        loadDockerSecrets();
    }
    else {
        require('dotenv').config();
    }
};
