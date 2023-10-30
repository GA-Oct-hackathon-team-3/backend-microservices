import './utilities/config-secrets';
import express from 'express';
import sanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import connectDB from './utilities/config-db';

const PORT = process.env.PORT || 3001

const configureApp = (middleware?: any[]) => {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(sanitize());

    if (middleware) {
        app.use(middleware);
    }

    return app;
}

const app = configureApp();

app.listen(PORT, () => console.log(`Authentication service running at http://localhost:${PORT}/`));

// Error-tolerant rabbit connection
async function initializeServices() {
    await initializeRabbitMQ();
    const rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
}

connectDB();

(async () => await initializeServices())();