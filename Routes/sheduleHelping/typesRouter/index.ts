import { typesController } from "../../../Controllers/typesController";
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const typesRouter = express.Router();
const controller = new typesController();

typesRouter.post('/add', roleMiddleware(['ADMIN']), controller.addType);
typesRouter.get('/get', roleMiddleware(['USER', "ADMIN"]), controller.getTypes);
typesRouter.post('/edit', roleMiddleware(["ADMIN"]), controller.editType);


export { typesRouter };