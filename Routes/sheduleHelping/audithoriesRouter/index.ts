import { audithoriesController } from "../../../Controllers/audithoriesController"
import { roleMiddleware } from "../../../middlewares/roleMiddleware";


const express = require('express');
const audithoriesRouter = express.Router();
const controller = new audithoriesController();

audithoriesRouter.post("/add", roleMiddleware(['ADMIN']), controller.addAudit);
audithoriesRouter.get("/get", roleMiddleware(['USER',"ADMIN"]), controller.getAudithories);
audithoriesRouter.post("/edit", roleMiddleware(["ADMIN"]), controller.editAudit);


export { audithoriesRouter };