import express, { Express, RequestHandler, request, response } from 'express';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import { useExpressServer } from 'routing-controllers';
import swaggerUi from 'swagger-ui-express';
import { authRouter } from './Routes/authRouter'

const app = express();

const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/auth", authRouter)

const start = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Schedule')
        app.listen(PORT, () => console.log(`Running on port ${PORT}`))
    } catch (e) {
        console.warn(e)
    }
}

start();