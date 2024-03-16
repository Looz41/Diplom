import { authController, registrationValidationRules } from "../../Controllers/authController";
import { roleMiddleware } from "../../middlewares/roleMiddleware";

const express = require('express');
const authRouter = express.Router();
const controller = new authController();


authRouter.post('/registration', registrationValidationRules, controller.registration);
authRouter.post('/login', controller.login);
authRouter.get('/users', roleMiddleware(['ADMIN']), controller.getUsers);

export { authRouter };