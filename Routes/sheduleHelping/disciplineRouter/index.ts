import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();

disciplineRouter.post("/add", roleMiddleware(['ADMIN']), controller.addDiscipline);
disciplineRouter.get("/get", roleMiddleware(['USER',"ADMIN"]), controller.getDiscipline);
disciplineRouter.post("/edit", roleMiddleware(["ADMIN"]), controller.editDiscipline);
disciplineRouter.post("/delete", roleMiddleware(["ADMIN"]), controller.deleteDiscipline);

export { disciplineRouter };