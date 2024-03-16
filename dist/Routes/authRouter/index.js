"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var authController_1 = require("../../Controllers/authController");
var roleMiddleware_1 = require("../../middlewares/roleMiddleware");
var express = require('express');
var authRouter = express.Router();
exports.authRouter = authRouter;
var controller = new authController_1.authController();
var authMiddleware = require('../../middlewares/authMiddleware');
authRouter.post('/registration', authController_1.registrationValidationRules, controller.registration);
authRouter.post('/login', controller.login);
authRouter.get('/users', (0, roleMiddleware_1.roleMiddleware)(['ADMIN']), controller.getUsers);
//# sourceMappingURL=index.js.map