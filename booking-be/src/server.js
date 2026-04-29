import express from "express";
import bodyParser from "body-parser";
import http from 'http';
import helmet from 'helmet';

import viewEngine from "./config/viewEngine";
import initWebRoutes from './route/web';
import connectDB from './config/connectDB';
import cors from 'cors';
import { initSocket } from './socket';
import { initCronJobs } from './config/cron';
import logger from './config/logger';
require('dotenv').config();
import './config/password';


let app = express();
// Security headers. CSP is disabled because the EJS views load external Bootstrap/FontAwesome CDN
// and the React frontend is served separately; tighten later with a reporting-only policy if needed.
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));
app.use(cors({ credentials: true, origin: true }));
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACT);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// config app
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//
viewEngine(app);
// Liveness + readiness probe; used by docker-compose healthcheck / uptime monitors.
app.get('/api/health', async (req, res) => {
    const db = require('./models').default || require('./models');
    const info = { status: 'ok', uptime: process.uptime(), ts: Date.now() };
    try {
        if (db && db.sequelize) {
            await db.sequelize.authenticate();
            info.db = 'up';
        }
    } catch (e) {
        info.status = 'degraded';
        info.db = 'down';
    }
    res.status(info.status === 'ok' ? 200 : 503).json(info);
});
initWebRoutes(app);

// Final error handler — log structured stack instead of crashing silently.
app.use((err, req, res, next) => {
    logger.error('unhandled-error', { err: err.message, stack: err.stack, url: req.url, method: req.method });
    if (res.headersSent) return next(err);
    res.status(500).json({ errCode: -1, errMessage: 'Internal server error' });
});

connectDB();
let port = process.env.PORT || 8080;
const httpServer = http.createServer(app);
initSocket(httpServer);
initCronJobs();
httpServer.listen(port, () => {
    logger.info(`Backend Nodejs is running on port ${port}`);
});

process.on('unhandledRejection', (reason) => {
    logger.error('unhandled-rejection', { reason: reason && reason.message, stack: reason && reason.stack });
});
process.on('uncaughtException', (err) => {
    logger.error('uncaught-exception', { err: err.message, stack: err.stack });
});