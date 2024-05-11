import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();

disciplineRouter.post("/add", roleMiddleware(['ADMIN']), controller.addDiscipline);
disciplineRouter.get("/get", roleMiddleware(['USER',"ADMIN"]), controller.getDiscipline);
disciplineRouter.get("/edit", roleMiddleware(["ADMIN"]), controller.editDiscipline);


export { disciplineRouter };