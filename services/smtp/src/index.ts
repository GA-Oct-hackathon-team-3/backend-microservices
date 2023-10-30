import './utilities/config-secrets';
import { Channel, Connection, ConsumeMessage } from 'amqplib';
import { getChannel, getConnection, initializeRabbitMQ, res } from './utilities/config-amqp';
import rateLimiter from './utilities/rate-limiter';
import sendEmail from './utilities/send-email';
import { getFailureCount, incrementFailureCount, resetFailureCount } from './utilities/failure-limiter';
import { GenericBackoff } from '@cango91/presently-common/dist/functions/generic-backoff';

