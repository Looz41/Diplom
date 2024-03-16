"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
var config_1 = require("../../config");
var jwt = require('jsonwebtoken');
/**
 * Функция ограничения прав доступа по Роли
 * @param roles Массив строк, где строка это Роль
 * @returns Права доступа
 */
var roleMiddleware = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next();
        }
        try {
            var token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }
            var userRoles = jwt.verify(token, config_1.SecretKey.secret).roles;
            var hasRole_1 = false;
            userRoles.forEach(function (role) {
                if (roles.includes(role)) {
                    hasRole_1 = true;
                }
            });
            if (!hasRole_1) {
                return res.status(403).json({ message: "У вас нет доступа" });
            }
            next();
        }
        catch (e) {
            console.log(e);
            return res.status(403).json({ message: 'Пользователь не авторизован' });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
//# sourceMappingURL=index.js.map