import { scheduleController } from "../../../Controllers/scheduleController";
import { roleMiddleware } from "../../../middlewares/roleMiddleware";

const express = require('express');
const scheduleRouter = express.Router();
const controller = new scheduleController();

scheduleRouter.post('/add', roleMiddleware(['ADMIN']), controller.addSchedule);
scheduleRouter.get('/get', roleMiddleware(['USER', "ADMIN"]), controller.getShedule);
scheduleRouter.get('/getExcel', roleMiddleware(['USER', "ADMIN"]), controller.getScheduleAsExcel);
scheduleRouter.post('/edit', roleMiddleware(["ADMIN"]), controller.editSchedule);

export { scheduleRouter };