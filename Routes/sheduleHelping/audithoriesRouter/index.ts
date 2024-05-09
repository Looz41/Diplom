import { disciplineController } from "../../../Controllers/disciplineController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";


const express = require('express');
const audirhoriesRouter = express.Router();
const controller = new disciplineController();

audirhoriesRouter.post("/add", roleMiddleware(['ADMIN']), controller.addDiscipline);
audirhoriesRouter.get("/get", roleMiddleware(['USER',"ADMIN"]), controller.getDiscipline);


export { audirhoriesRouter };