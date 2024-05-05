import { authController, registrationValidationRules } from "../../Controllers/authController";
import { roleMiddleware } from "../../middlewares/roleMiddleware";

const express = require('express');
const authRouter = express.Router();
const controller = new authController();


authRouter.post('/registration', controller.registration);
authRouter.post('/login', controller.login);
authRouter.get('/users', roleMiddleware(['ADMIN']), controller.getUsers);
authRouter.get('/addRole', controller.addRole);
authRouter.get('/check', controller.checkToken);

export { authRouter };