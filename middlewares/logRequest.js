import { appendFileSync } from 'fs';

export default function logRequest(req, res, next) {
    const log = `${new Date().toISOString()}::: URL: ${req.originalUrl}, METHOD: ${req.method}\n`;
    appendFileSync('request_logs.txt', log);
    next();
}
