import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const disciplineRouter = express.Router();
const controller = new teacherController();

disciplineRouter.get('/getByName', roleMiddleware(["ADMIN"]), controller.getDisciplineByName);

export { disciplineRouter };