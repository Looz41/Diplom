import { teachersController } from "../../../Controllers/teacherController";
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const teacherRouter = express.Router();
const controller = new teachersController();

teacherRouter.post('/add', roleMiddleware(['ADMIN']), controller.addTeacher);
teacherRouter.get('/get', roleMiddleware(['USER', "ADMIN"]), controller.getTeacher);
teacherRouter.get('/getTeacherByDiscipline', roleMiddleware(['USER', "ADMIN"]), controller.getTeacherByDiscipline);
teacherRouter.get('/edit', roleMiddleware(["ADMIN"]), controller.editTeacher);

export { teacherRouter };