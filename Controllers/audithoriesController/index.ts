import { Request, Response } from "express"

import { Audithories } from "../../models/index";

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
 *               pc:
 *                 type: boolean
 *                 description: Компьютерная ли аудитория.
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

            const { name, pc } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Параметр name обязателен' });
            }

            const existingAudithor = await Audithories.findOne({ name });
            if (existingAudithor) {
                return res.status(409).json({ error: `Аудитория ${name} уже существует` });
            }

            const newAudit = new Audithories({ name, pc: pc || false });
            await newAudit.save();

            res.json({ message: `Аудитория ${name} успешно создана` });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Редактирование аудитории
     * @swagger
     * /audithories/edit:
     *   post:
     *     summary: Редактировать аудиторию
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
     *               id:
     *                 type: string
     *                 description: Уникальный идентификатор аудитории.
     *               name:
     *                 type: string
     *                 description: Новое имя аудитории.
     *               pc:
     *                 type: boolean
     *                 description: Компьютерная аудитория.
     *             required:
     *               - id
     *               - name
     *               - pc
     *     responses:
     *       '200':
     *         description: Успешное редактирование аудитории.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение о успешном редактировании аудитории.
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
     *       '404':
     *         description: Аудитория не найдена.
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
    async editAudit(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода', errors: errors.array() });
            }

            const { id, name, pc } = req.body;

            if (!id || !name) {
                return res.status(400).json({ error: 'Параметры id и name обязательны' });
            }

            const existingAudithor = await Audithories.findById(id);
            if (!existingAudithor) {
                return res.status(404).json({ error: `Аудитория с id ${id} не найдена` });
            }

            existingAudithor.name = name;
            existingAudithor.pc = pc;
            await existingAudithor.save();

            res.json({ message: `Аудитория с id ${id} успешно отредактирована` });
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


    /**
 * Удаление аудитории
 * @swagger
 * /audithories/delete:
 *   post:
 *     summary: Удалить аудиторию
 *     description: Удаляет аудиторию по её идентификатору
 *     tags: [audithories]
  *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         description: Идентификатор аудитории, которую нужно удалить
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Аудитория успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном удалении аудитории
 *       404:
 *         description: Аудитория не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение о том, что аудитория не была найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке сервера
 */
    async deleteAudit(req: Request, res: Response) {
        try {
            const auditId = req.query.id;

            const existingAudit = await Audithories.findById(auditId);
            if (!existingAudit) {
                return res.status(404).json({ message: "Аудитория не найдена" });
            }

            await Audithories.findByIdAndDelete(auditId);

            res.status(200).json({ message: "Аудитория успешно удалена" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { audithoriesController };
