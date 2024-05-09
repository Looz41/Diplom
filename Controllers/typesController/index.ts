import { Request, Response } from "express"

import Types from '../../models/Types/index';

const { validationResult } = require('express-validator')

class typesController {


    /**
 * Добавление нового типа
 * @swagger
 * /types/add:
 *   post:
 *     summary: Добавить новый тип
 *     tags: [types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя нового типа.
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: Успешное создание типа.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение о успешном создании типа.
 *       '400':
 *         description: Некорректный запрос.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Сообщение об ошибке.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       param:
 *                         type: string
 *                         description: Название параметра с ошибкой.
 *                       msg:
 *                         type: string
 *                         description: Сообщение об ошибке.
 *       '409':
 *         description: Конфликт существующего типа.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Сообщение об ошибке.
 *       '500':
 *         description: Внутренняя ошибка сервера.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке.
 */
    async addType(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода', errors: errors.array() });
            }

            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Параметр "имя" обязателен' });
            }

            const existingTeacher = await Types.findOne({ name });
            if (existingTeacher) {
                return res.status(409).json({ error: `Тип ${name} уже существует` });
            }

            const newType = new Types({ name });
            await newType.save();

            res.json({ message: `Тип ${name} успешно создан` });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Получение всех типов
 * @swagger
 * /types/get:
 *   get:
 *     summary: Получить все типы
 *     description: Возвращает список всех доступных типов.
 *     tags: [types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Успешное получение списка типов.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 types:
 *                   type: array
 *                   description: Список всех доступных типов.
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Название типа.
 *       '404':
 *         description: Не найдено ни одного типа.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об отсутствии типов.
 *       '500':
 *         description: Внутренняя ошибка сервера.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке.
 */
    async getTypes(req: Request, res: Response) {
        try {
            const types = await Types.find();

            if (!types || types.length === 0) {
                return res.status(404).json({ message: "Нет доступных типов" });
            }

            res.json({ types: types });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { typesController };
