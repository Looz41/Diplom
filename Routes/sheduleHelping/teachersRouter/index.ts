import { teachersController } from "../../../Controllers/teacherController";
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const teacherRouter = express.Router();
const controller = new teachersController();

teacherRouter.post('/add', controller.addTeacher);
teacherRouter.get('/getTeacherByDiscipline', controller.getTeacherByDiscipline);

export { teacherRouter };