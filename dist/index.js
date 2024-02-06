import express, { Express, RequestHandler, request, response } from 'express';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import { useExpressServer } from 'routing-controllers';
import swaggerUi from 'swagger-ui-express';

const app = express();

const PORT = process.env.PORT || 5000;

const start = () => {
    try {
        app.listen(PORT, () => console.log(`Running on port ${PORT}`))
    } catch (e) {
        console.warn(e)
    }
}

start();