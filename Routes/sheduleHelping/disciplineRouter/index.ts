import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";


const express = require('express');
const disciplineRouter = express.Router();
const controller = new disciplineController();


disciplineRouter.get('/get', controller.getDiscipline);
disciplineRouter.get('/getByName', controller.getDisciplineByName);
disciplineRouter.get('/getByGroup', controller.getDisciplineByGroup);
disciplineRouter.post("/add", roleMiddleware(["ADMIN"]), controller.addDiscipline);


export { disciplineRouter };