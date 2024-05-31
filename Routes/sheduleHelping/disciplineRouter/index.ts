import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();

disciplineRouter.post("/add", roleMiddleware(['ADMIN']), controller.addDiscipline);
disciplineRouter.get("/get", roleMiddleware(['USER',"ADMIN"]), controller.getDiscipline);
disciplineRouter.post("/edit", roleMiddleware(["ADMIN"]), controller.editDiscipline);
disciplineRouter.post("/delete", roleMiddleware(["ADMIN"]), controller.deleteDiscipline);
disciplineRouter.post("/addGroupToDiscipline", roleMiddleware(["ADMIN"]), controller.addGroupToDiscipline);
disciplineRouter.post("/deleteGroupFromDiscipline", roleMiddleware(["ADMIN"]), controller.deleteGroupFromDiscipline);
disciplineRouter.post("/addTeacherToDiscipline", roleMiddleware(["ADMIN"]), controller.addTeacherToDiscipline);
disciplineRouter.post("/deleteTeacherFromDiscipline", roleMiddleware(["ADMIN"]), controller.deleteTeacherFromDiscipline);

export { disciplineRouter };