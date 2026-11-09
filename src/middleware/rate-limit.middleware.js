import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { BadRequestException } from '../Utils/Security/Errors/exceptions.error.js';
import axios from 'axios';
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../Common/Clients/redis.client.js';

function getIpDetails(ip) {
    return axios.get(`http://ip-api.com/json/${ip}`);
}

// now a function, so the store is created only when you call it (after Redis is connected)
export const rateLimiter = () => rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: async (req) => {
        try {
            // x-forwarded-for may hold several IPs, the first one is the client; locally use req.ip
            const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
            const { data: { countryCode } } = await getIpDetails(ip)
            switch (countryCode) {
                case 'US': return 5;
                case 'EG': return 50;
                case 'GB': return 80;
                default: return 20;
            }
        } catch {
            return 20;   // if the IP lookup fails, don't break every request
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    requestPropertyName: 'rateLimiterInfo',
    handler: (req, res, next) => {
        next(new BadRequestException('too many requests', null, "TOO_MANY_REQUESTS"))
    },
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}_${req.url}`,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),   //collect commands and send it to redis
    }),
})