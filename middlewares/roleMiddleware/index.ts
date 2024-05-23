import { NextFunction, Request, Response } from "express";
require('dotenv').config();
const jwt = require('jsonwebtoken')

export const roleMiddleware = (roles: Array<string>) => {
    return function (req: Request, res: Response, next: NextFunction) {
        if (req.method === "OPTIONS") {
            next();
            return;
        }

        try {
            const token = req.headers.authorization?.split(' ')[1]; // Проверяем, что headers не undefined
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }

            const { roles: userRoles } = jwt.verify(token, process.env.SECRETKEY) as { roles: string[] }; // Указываем тип для roles
            let hasRole = false;
            userRoles.forEach((role: string) => {
                if (roles.includes(role)) {
                    hasRole = true;
                }
            });
            if (!hasRole) {
                return res.status(403).json({ message: "У вас нет доступа" });
            }
            next();
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: 'Пользователь не авторизован' });
        }
    };
};
