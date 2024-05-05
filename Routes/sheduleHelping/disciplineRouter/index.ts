import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";


const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();

disciplineRouter.post("/add", roleMiddleware(['ADMIN']), controller.addDiscipline);
disciplineRouter.get("/get", roleMiddleware(['USER']), controller.getDiscipline);


export { disciplineRouter };