import { Request, Response } from "express"
import { Workbook } from 'exceljs';

import {
    Disciplines,
    Schedule,
    Teachers,
    Audithories,
    Types
} from "../../models/index";

interface ScheduleItem {
    discipline: string;
    teacher: string;
    type: string;
    audithoria: string;
    number: number;
}

function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}

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
    *               group:
    *                 type: string
    *                 format: string
    *                 description: ID группы.
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
    *                     number:
    *                       type: integer
    *                       description: Номер занятия.
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
    *       '400':
    *         description: Ошибка в запросе.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    *                   description: Сообщение об ошибке в запросе.
    *       '409':
    *         description: Конфликт.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    *                   description: Сообщение о конфликте.
    *       '500':
    *         description: Внутренняя ошибка сервера.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 message:
    *                   type: string
    *                   description: Сообщение об ошибке сервера.
    */
    async addSchedule(req: Request, res: Response) {
        try {
            const { date, group, items } = req.body;

            for (const item of items) {
                const discipline = await Disciplines.findOne({ _id: item.discipline, teachers: item.teacher });
                if (!discipline) {
                    return res.status(400).json({ message: `Учитель с ID ${item.teacher} не ведет дисциплину с ID ${item.discipline}` });
                }
            }

            const existingSchedule = await Schedule.findOne({
                date,
                $or: items.map((item: ScheduleItem) => ({
                    'items.number': item.number,
                    $or: [
                        { 'items.teacher': item.teacher },
                        { 'items.audithoria': item.audithoria }
                    ]
                }))
            });

            if (existingSchedule) {
                return res.status(400).json({ message: "Учитель или аудитория уже заняты на эту пару в указанную дату" });
            }



            const newSchedule = new Schedule({
                date,
                group,
                items
            });

            await newSchedule.save();

            const teachersIds = items.map((item: ScheduleItem) => item.teacher);
            const teachers = await Teachers.find({ _id: { $in: teachersIds } });

            for (const teacher of teachers) {
                if (teacher.hH !== undefined && teacher.hH !== null) {
                    teacher.hH += 2;
                } else {
                    teacher.hH = 2;
                }
                await teacher.save();
            }

            res.status(200).json({ message: "Расписание успешно создано" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Редактирование расписания
     * @swagger
     * /schedule/edit:
     *   post:
     *     summary: Редактирование расписания
     *     description: Обновляет существующее расписание.
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
     *               id:
     *                 type: string
     *                 description: Уникальный идентификатор расписания.
     *               date:
     *                 type: string
     *                 format: date
     *                 description: Новая дата расписания.
     *               group:
     *                 type: string
     *                 description: Новый ID группы.
     *               items:
     *                 type: array
     *                 description: Новые элементы расписания.
     *                 items:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: Уникальный идентификатор элемента расписания.
     *                     discipline:
     *                       type: string
     *                       description: Новый ID дисциплины.
     *                     teacher:
     *                       type: string
     *                       description: Новый ID преподавателя.
     *                     type:
     *                       type: string
     *                       description: Новый ID типа.
     *                     audithoria:
     *                       type: string
     *                       description: Новый ID аудитории.
     *                     number:
     *                       type: integer
     *                       description: Новый номер занятия.
     *     responses:
     *       '200':
     *         description: Успешное обновление расписания.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об успешном обновлении расписания.
     *       '400':
     *         description: Ошибка в запросе.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке в запросе.
     *       '404':
     *         description: Расписание не найдено.
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
     *                   description: Сообщение об ошибке сервера.
     */
    async editSchedule(req: Request, res: Response) {
        try {
            const { id, date, group, items } = req.body;

            if (!id || !date || !group || !items) {
                return res.status(400).json({ message: 'Параметры id, date, group и items обязательны' });
            }

            const existingSchedule = await Schedule.findById(id);
            if (!existingSchedule) {
                return res.status(404).json({ error: `Расписание с id ${id} не найдено` });
            }

            existingSchedule.date = date;
            existingSchedule.group = group;
            existingSchedule.items = items;
            await existingSchedule.save();

            res.status(200).json({ message: "Расписание успешно обновлено" });
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
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: ID группы для фильтрации расписания.
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

            if (typeof req.query.group === 'string') {
                query["group"] = req.query.group;
            }

            const schedule = await Schedule.find(query)
                .populate('group', 'name')
                .populate('items.discipline', 'name')
                .populate('items.teacher')
                .populate('items.audithoria', 'name')
                .populate('items.type', 'name')
                .exec();

            if (!schedule || schedule.length === 0) {
                return res.status(404).json({ message: "Расписание не найдено" });
            }

            res.status(200).json({ schedule });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
    * Получение расписания
    * @swagger
    * /schedule/getExcel:
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
    *       - in: query
    *         name: group
    *         schema:
    *           type: string
    *         description: ID группы для фильтрации расписания.
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
    async getSheduleExcel(req, res) {
        try {
            let query: any = {};

            if (typeof req.query.date === 'string') {
                query.date = req.query.date;
            }

            if (typeof req.query.teacher === 'string') {
                query["items.teacher"] = req.query.teacher;
            }

            if (typeof req.query.group === 'string') {
                query["group"] = req.query.group;
            }

            const schedule = await Schedule.find(query)
                .populate('group', 'name')
                .populate('items.discipline', 'name')
                .populate('items.teacher')
                .populate('items.audithoria', 'name')
                .populate('items.type', 'name')
                .exec();

            if (!schedule || schedule.length === 0) {
                return res.status(404).json({ message: "Расписание не найдено" });
            }

            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Расписание');

            // Установка заголовка
            worksheet.addRow(['Группа', 'Дата', 'Пара', 'Дисциплина', 'Преподаватель', 'Тип', 'Аудитория']);

            // Группировка данных по группам
            const groupedSchedule = groupBy(schedule, 'group.name');

            // Заполнение таблицы Excel данными
            for (const groupName in groupedSchedule) {
                if (groupedSchedule.hasOwnProperty(groupName)) {
                    const groupSchedules = groupedSchedule[groupName];
                    worksheet.addRow([groupName]);

                    for (const schedule of groupSchedules) {
                        for (const item of schedule.items) {
                            worksheet.addRow([
                                null, // Пустая ячейка для группы, чтобы не повторять её на каждой строке
                                schedule.date,
                                item.number,
                                `${item.discipline.name}, ${item.teacher.surname}, ${item.type.name}, ${item.audithoria.name}`
                            ]);
                        }
                    }
                }
            }

            // Генерация файла Excel
            const excelBuffer = await workbook.xlsx.writeBuffer();

            // Отправка файла Excel на клиент
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=расписание.xlsx');
            res.send(excelBuffer);
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { scheduleController };
