import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authRouter } from './Routes/authRouter';
import { disciplineRouter } from './Routes/sheduleHelping/disciplineRouter';
import { facultetRouter } from './Routes/facultetRouter';
import { teacherRouter } from './Routes/sheduleHelping/teachersRouter';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { typesRouter } from './Routes/sheduleHelping/typesRouter';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Middleware для отключения CORS (временно!)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRouter);
app.use('/discipline', disciplineRouter);
app.use('/facultet', facultetRouter);
app.use('/teacher', teacherRouter);
app.use('/types', typesRouter);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Расписание',
            version: '1.0.0',
            description: 'Документация api генерации расписания',
            contact: {
                name: 'Клиент',
                url: 'http://79.174.83.183:3000'
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
                url: 'http://localhost:5000',
                description: 'local',
            },
            {
                url: 'http://79.174.83.183:5000',
                description: 'Development server',
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

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.5');
        app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    } catch (e) {
        console.warn(e);
    }
};

start();
