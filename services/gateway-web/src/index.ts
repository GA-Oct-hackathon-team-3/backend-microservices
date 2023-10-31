import './utilities/config-secrets';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { FRONTEND_URL } from '@cango91/presently-common/dist/constants';
import cors from 'cors';
import { getConnection, initializeRabbitMQ } from './utilities/config-amqp';
import express from 'express';
import bearer from './middleware/bearer';
import userRouter from './routes/user-router';
import friendRouter from './routes/friends-router';

const port = 3010;

const configureApp = (middleware?: any[]) => {
    const app = express();

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(cookieParser(process.env.GATEWAY_COOKIE_SECRET));
    app.use(cors({
        credentials: true,
        origin: FRONTEND_URL
    }));

    if (middleware) {
        app.use(middleware);
    }

    return app;
}


const app = configureApp([bearer]);

app.use('/api/users', userRouter);
app.use('/api/friends', friendRouter);

app.listen(port, () => console.log(`Gateway Web API service running at http://localhost:${port}/`));

async function initializeServices() {
    await initializeRabbitMQ()
    const rabbitConn = getConnection();
    rabbitConn.on("error", () => console.log("Rabbit MQ connection closed unexpectedly"));
    rabbitConn.on("close", initializeServices);
}

(async () => {
    initializeServices();
})();