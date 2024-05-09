import { Request, Response } from "express"

import { Audithories } from "models/";

const { validationResult } = require('express-validator')

class audithoriesController {


    /**
 * Добавление новой аудитории
 * @swagger
 * /audithories/add:
 *   post:
 *     summary: Добавить новую аудитории
 *     tags: [audithories]
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
 *                 description: Имя новой аудитории.
 *             required:
 *               - name
 *     responses:
 *       '200':
 *         description: Успешное создание аудитории.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение о успешном создании аудитории.
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
    async addAudit(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода', errors: errors.array() });
            }

            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Параметр name обязателен' });
            }

            const existingAudithor = await Audithories.findOne({ name });
            if (existingAudithor) {
                return res.status(409).json({ error: `Аудитория ${name} уже существует` });
            }

            const newAudit = new Audithories({ name });
            await newAudit.save();

            res.json({ message: `Аудитория ${name} успешно создана` });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Получение всех аудиторий
 * @swagger
 * /audithories/get:
 *   get:
 *     summary: Получить все типы
 *     description: Возвращает список всех доступных аудиторий.
 *     tags: [audithories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Успешное получение списка аудиторий.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 types:
 *                   type: array
 *                   description: Список всех доступных аудиторий.
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Название аудитории.
 *       '404':
 *         description: Не найдено ни одного типа.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об отсутствии аудиторий.
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
    async getAudithories(req: Request, res: Response) {
        try {
            const audithories = await Audithories.find();

            if (!audithories || audithories.length === 0) {
                return res.status(404).json({ message: "Нет доступных аудиторий" });
            }

            res.json({ audithories: audithories });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { audithoriesController };
