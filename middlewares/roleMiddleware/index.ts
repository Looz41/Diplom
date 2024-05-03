import { NextFunction, Request, Response } from "express";
import { SecretKey } from "../../config";
const jwt = require('jsonwebtoken')

/**
 * Функция ограничения прав доступа по Роли
 * @param roles Массив строк, где строка это Роль
 * @returns Права доступа
 */
export const roleMiddleware = (roles: Array<string>) => {
    return function (req: Request, res: Response, next: NextFunction) {
        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const token = req.headers.authorization.split(' ')[1]
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' })

            }
            const { roles: userRoles } = jwt.verify(token, SecretKey.secret)
            let hasRole: boolean = false
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true
                }
            });
            if (!hasRole) {
                return res.status(403).json({ message: "У вас нет доступа" })
            }
            next()
        } catch (e) {
            console.log(e);
            return res.status(403).json({ message: 'Пользователь не авторизован' })
        }
    }
};