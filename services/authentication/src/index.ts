import secrets from '@cango91/presently-common/dist/functions/config-secrets';
secrets();
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import serviceAuth from '@cango91/presently-common/dist/middleware/service-authentication';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import connectDB from './utilities/config-db';
import authRouter from './routes/auth-router';

const PORT = process.env.PORT || 3001

const configureApp = (middleware?: any[]) => {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(sanitize());

    if (middleware) {
        app.use(middleware);
    }

    app.use('/api', authRouter);

    return app;
}

const app = configureApp([serviceAuth(process.env.AUTH_SERVICE_SECRET!)]);

const server = app.listen(PORT, () => console.log(`Authentication service running at http://localhost:${PORT}/`));

// Error-tolerant rabbit connection
async function initializeServices() {
    await initializeRabbitMQ();
    const rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
}

if (process.env.NODE_ENV !== "test"){
    connectDB();
    (async () => await initializeServices())();
}


export {
    app,
    configureApp,
    server
}