import { facultetController } from "../../Controllers/facultetController";
import { roleMiddleware } from "../../middlewares/roleMiddleware";

const express = require('express');
const facultetRouter = express.Router();
const controller = new facultetController;

facultetRouter.post("/add", roleMiddleware(['ADMIN']), controller.addFacultet);
facultetRouter.get("/get", roleMiddleware(['ADMIN', "USER"]), controller.getFacultets);
facultetRouter.get("/getOne", roleMiddleware(['ADMIN', "USER"]), controller.getFacultet);
facultetRouter.post("/edit", roleMiddleware(['ADMIN']), controller.editFacultet);
facultetRouter.post("/delete", roleMiddleware(["ADMIN"]), controller.deleteFacultet);
facultetRouter.post("/editGroup", roleMiddleware(["ADMIN"]), controller.editGroup);
facultetRouter.post("/deleteGroup", roleMiddleware(["ADMIN"]), controller.deleteGroup);
facultetRouter.post("/deleteGroup", roleMiddleware(["ADMIN"]), controller.deleteGroup);

export { facultetRouter };