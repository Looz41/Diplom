import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
require('dotenv').config();

import {
    authRouter,
    disciplineRouter,
    facultetRouter,
    teacherRouter,
    typesRouter,
    audithoriesRouter,
    scheduleRouter
} from './Routes/';
import logger from './tglogger';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Middleware для отключения CORS (временно!)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://atk-dstu.ru');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/backend/auth', authRouter);
app.use('/backend/discipline', disciplineRouter);
app.use('/backend/facultet', facultetRouter);
app.use('/backend/teacher', teacherRouter);
app.use('/backend/types', typesRouter);
app.use('/backend/audithories', audithoriesRouter);
app.use('/backend/schedule', scheduleRouter);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Расписание',
            version: '1.0.0',
            description: 'Документация api генерации расписания',
            contact: {
                name: 'Клиент',
                url: process.env.SITEURL
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
        },
        servers: [
            {
                url: `${process.env.SITEURL}/backend`,
                description: 'Development server',
            },
            {
                url: 'http://localhost:5000',
                description: 'local',
            },
        ],
    },
    apis: [path.resolve(__dirname, './Controllers/**/*.ts')],
};

const specs = swaggerJsdoc(options);
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

const start = async () => {
    try {
        await mongoose.connect('mongodb://Looz1:Dogs2020@95.163.222.194:27017/admin');
        app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    } catch (e) {
        console.warn(e);
    }
};

start();
