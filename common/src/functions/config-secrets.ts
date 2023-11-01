import fs from 'fs';
import path from 'path';

const SECRETS_PATH = process.env.SECRETS_PATH || '/run/secrets/';

const loadSecrets = () => {
    const secrets = fs.readdirSync(SECRETS_PATH);

    secrets.forEach((secret) => {
        const secretValue = fs.readFileSync(path.join(SECRETS_PATH, secret), 'utf8').trim();
        process.env[secret] = secretValue;
    });
};

const loadDockerSecrets = () => {
    const secretsPath = '/run/secrets/';
    const secrets = fs.readdirSync(secretsPath);

    secrets.forEach((secret) => {
        const secretValue = fs.readFileSync(path.join(secretsPath, secret), 'utf8').trim();
        process.env[secret] = secretValue;
    });
};

export default () => {
    if (process.env.KUBERNETES) {
        loadSecrets();
    } else if (process.env.DOCKER) {
        loadDockerSecrets();
    } else {
        require('dotenv').config();
    }
}