import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";


const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();

disciplineRouter.post("/add", controller.addDiscipline);
disciplineRouter.get("/get", controller.getDiscipline);


export { disciplineRouter };