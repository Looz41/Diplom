import express from 'express';
import mongoose from 'mongoose';
import { authRouter } from './Routes/authRouter';
import { disciplineRouter } from './Routes/sheduleHelping/disciplineRouter';
import { facultetRouter } from './Routes/facultetRouter';
import { teacherRouter } from './Routes/sheduleHelping/teachersRouter'; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Middleware для отключения CORS (временно!)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/auth', authRouter);
app.use('/discipline', disciplineRouter);
app.use('/facultet', facultetRouter);
app.use('/teacher', teacherRouter);

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Schedule');
        app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    } catch (e) {
        console.warn(e);
    }
};

start();