import { facultetController } from "../../Controllers/facultetController";
import { roleMiddleware } from "../../middlewares/roleMiddleware";

const express = require('express');
const facultetRouter = express.Router();
const controller = new facultetController;

facultetRouter.post("/add", controller.addFacultet);
facultetRouter.get("/get", controller.getFacultets);
facultetRouter.get("/getOne", controller.getFacultet);

export { facultetRouter };