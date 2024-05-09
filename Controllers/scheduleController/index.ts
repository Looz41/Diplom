import { Request, Response } from "express"

import { Schedule } from "../../models/index";

class scheduleController {

    /**
 * Добавление расписания
 * @swagger
 * /schedule/add:
 *   post:
 *     summary: Добавить расписание
 *     description: Создает новое расписание.
 *     tags: [schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Дата расписания.
 *               items:
 *                 type: array
 *                 description: Элементы расписания.
 *                 items:
 *                   type: object
 *                   properties:
 *                     discipline:
 *                       type: string
 *                       description: ID дисциплины.
 *                     teacher:
 *                       type: string
 *                       description: ID преподавателя.
 *                     type:
 *                       type: string
 *                       description: ID типа.
 *                     audithoria:
 *                       type: string
 *                       description: ID аудитории.
 *     responses:
 *       '200':
 *         description: Успешное создание расписания.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение о успешном создании расписания.
 *                 schedule:
 *                   $ref: '#/components/schemas/Schedule'
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
    async addSchedule(req: Request, res: Response) {
        try {
            const { date, items } = req.body;

            // Check if the teacher is already booked for the given class number on the given date
            const existingSchedule = await Schedule.findOne({ date, 'items.number': { $in: items.map(item => item.number) }, 'items.teacher': { $in: items.map(item => item.teacher) } });

            if (existingSchedule) {
                return res.status(400).json({ message: "Учитель уже занят на эту пару в указанную дату" });
            }

            const newSchedule = new Schedule({
                date,
                items
            });

            await newSchedule.save();

            res.status(200).json({ message: "Расписание успешно создано", schedule: newSchedule });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Получение расписания
 * @swagger
 * /schedule/get:
 *   get:
 *     summary: Получить расписание
 *     description: Возвращает расписание. Если параметры не указаны, возвращает полное расписание.
 *     tags: [schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата для фильтрации расписания в формате YYYY-MM-DD.
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: string
 *         description: ID преподавателя для фильтрации расписания.
 *     responses:
 *       '200':
 *         description: Успешное получение расписания.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule:
 *                   type: array
 *                   description: Расписание.
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       '404':
 *         description: Расписание не найдено.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об отсутствии расписания.
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
    async getShedule(req: Request, res: Response) {
        try {
            let query: any = {};

            if (typeof req.query.date === 'string') {
                query.date = req.query.date;
            }

            if (typeof req.query.teacher === 'string') {
                query["items.teacher"] = req.query.teacher;
            }

            const schedule = await Schedule.find(query);

            if (!schedule || schedule.length === 0) {
                return res.status(404).json({ message: "Расписание не найдено" });
            }

            // Возвращаем найденное расписание
            res.status(200).json({ schedule });
        } catch (error) {
            // В случае ошибки возвращаем соответствующий статус и сообщение об ошибке
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { scheduleController };
