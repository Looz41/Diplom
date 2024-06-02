import { Request, Response } from "express"
import ExcelJS from 'exceljs';

import {
    Disciplines,
    Schedule,
    Teachers,
    Audithories,
    Groups,
    Types
} from "../../models/index";
import mongoose, { isValidObjectId } from "mongoose";

interface ScheduleItem {
    discipline: string;
    teacher: string;
    type: string;
    audithoria: string;
    number: number;
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

            if (!Array.isArray(items)) {
                return res.status(400).json({ message: 'Invalid items format' });
            }

            const avaliableTypes = ['Практическая работа', 'Лабораторная работа', 'Зачет', 'Экзамен'];

            const groupData = await Groups.findOne({ _id: group });
            if (!groupData) {
                return res.status(404).json({ message: 'Группа не найдена' });
            }

            for (const item of items) {
                if (!item.discipline || !item.teacher || !item.audithoria || !item.type || !item.number) {
                    return res.status(400).json({ message: 'Invalid item structure' });
                }

                const discipline = await Disciplines.findOne({ _id: item.discipline }).populate('groups.item');
                if (!discipline) {
                    return res.status(404).json({ message: `Дисциплина с ID ${item.discipline} не найдена` });
                }

                const disciplineExistsInGroup = discipline.groups.some(groupItem =>
                    groupItem.item.equals(group)
                );
                if (!disciplineExistsInGroup) {
                    return res.status(400).json({ message: `Дисциплина с ID ${item.discipline} не найдена в группе` });
                }

                const teacherValid = discipline.teachers.some(teacherId => teacherId.equals(item.teacher));
                if (!teacherValid) {
                    return res.status(400).json({ message: `Учитель с ID ${item.teacher} не ведет дисциплину с ID ${item.discipline}` });
                }

                const audithoria = await Audithories.findOne({ _id: item.audithoria });
                if (!audithoria) {
                    return res.status(404).json({ message: 'Аудитория не найдена' });
                }

                const type = await Types.findOne({ _id: item.type });
                if (!type) {
                    return res.status(404).json({ message: 'Тип не найден' });
                }

                // Validate if PC is required
                if (avaliableTypes.includes(type.name) && !(discipline.pc && audithoria.pc)) {
                    return res.status(400).json({ message: `Дисциплина ${discipline.name} на ${type.name} требует компьютерный класс` });
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
            const disciplinesIds = items.map((item: ScheduleItem) => item.discipline);
            const teachers = await Teachers.find({ _id: { $in: teachersIds } });
            const disciplines = await Disciplines.find({ _id: { $in: disciplinesIds } });


            for (const teacher of teachers) {
                const burdenItem = teacher.burden.find(e =>
                    e.mounth?.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }) === new Date(date).toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' })
                );

                if (!burdenItem || burdenItem.hH === undefined || burdenItem.hH === null) {
                    teacher.burden.push({
                        mounth: date,
                        hH: 2
                    });
                } else {
                    burdenItem.hH += 2;
                }

                await teacher.save();
            }

            for (const discipline of disciplines) {
                discipline.groups.forEach(group => {
                    const burdenItem = group.burden.find(burden => {
                        const burdenDate = burden.month;
                        return burdenDate.getMonth() === new Date(date).getMonth() && burdenDate.getFullYear() === new Date(date).getFullYear();
                    });

                    if (!burdenItem) {
                        group.burden.push({
                            month: date,
                            hH: 2
                        });
                    } else {
                        burdenItem.hH += 2;
                    }
                });

                await discipline.save();
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

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Неверный формат id' })
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
                const startOfDay = new Date(req.query.date);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(req.query.date);
                endOfDay.setUTCHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
                console.log('Диапазон дат для запроса:', query.date);
            }

            // Проверка и добавление фильтра по преподавателю
            if (typeof req.query.teacher === 'string') {
                query["items.teacher"] = req.query.teacher;
            }

            // Проверка и добавление фильтра по группе
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
    async getScheduleAsExcel(req: Request, res: Response) {
        try {
            let query: any = {};

            if (typeof req.query.date === 'string') {
                query.date = req.query.date;
            }

            if (typeof req.query.teacher === 'string' && isValidObjectId(req.query.teacher)) {
                query["items.teacher"] = req.query.teacher;
            }

            if (typeof req.query.group === 'string' && isValidObjectId(req.query.group)) {
                query["group"] = req.query.group;
            }

            const schedule = await Schedule.find(query)
                .populate({
                    path: 'group',
                    select: 'name'
                })
                .populate({
                    path: 'items.discipline',
                    model: Disciplines,
                    select: 'name'
                })
                .populate({
                    path: 'items.teacher',
                    model: Teachers,
                    select: 'surname'
                })
                .populate({
                    path: 'items.audithoria',
                    model: Audithories,
                    select: 'name'
                })
                .populate({
                    path: 'items.type',
                    model: Types,
                    select: 'name'
                })
                .exec();

            if (!schedule || schedule.length === 0) {
                return res.status(404).json({ message: "Расписание не найдено" });
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Schedule');

            worksheet.columns = [
                { header: 'Дата', key: 'date', width: 15 },
                { header: 'Номер пары', key: 'number', width: 30 },
                { header: 'Группа', key: 'groupName', width: 20 },
                { header: 'Предмет', key: 'disciplineName', width: 30 },
                { header: 'Преподаватель', key: 'teacherSurname', width: 30 },
                { header: 'Тип', key: 'typeName', width: 15 },
                { header: 'Аудитория', key: 'audithoriaName', width: 15 },
            ];

            schedule.forEach(entry => {
                entry.items.forEach(item => {
                    worksheet.addRow({
                        date: entry.date.toLocaleDateString('ru-Ru'),
                        number: item.number,
                        groupName: (entry.group as any).name,
                        disciplineName: (item.discipline as any).name,
                        teacherSurname: `${(item.teacher as any).surname} ${(item.teacher as any).name ? (item.teacher as any).name.slice(0, 1) : ''} ${(item.teacher as any).patronymic ? (item.teacher as any).patronymic.slice(0, 1) : ''}`,
                        typeName: (item.type as any).name,
                        audithoriaName: (item.audithoria as any).name,
                    });
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=schedule.xlsx');
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Удаление расписания
     * @swagger
     * /schedule/delete:
     *   post:
     *     summary: Удалить расписание
     *     description: Удаляет расписание по его идентификатору
     *     tags: [schedule]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         description: Идентификатор расписания, которое нужно удалить
     *         required: true
     *         schema:
     *           type: string
     *           format: ObjectId
     *     responses:
     *       200:
     *         description: Расписание успешно удалено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об успешном удалении
     *       404:
     *         description: Расписание не найдено
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение о том, что расписание не было найдено
     *       500:
     *         description: Ошибка сервера
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке сервера
     */
    async deleteSchedule(req: Request, res: Response) {
        try {
            const scheduleId = req.query.id;

            const existingSchedule = await Schedule.findById(scheduleId);
            if (!existingSchedule) {
                return res.status(404).json({ message: "Расписание не найдено" });
            }

            await Schedule.findByIdAndDelete(scheduleId);

            const teachersIds = existingSchedule.items.map(item => item.teacher);
            const teachers = await Teachers.find({ _id: { $in: teachersIds } });

            for (const teacher of teachers) {
                const burdenItem = teacher.burden.find(e =>
                    e.mounth?.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }) === existingSchedule.date.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' })
                );

                if (!burdenItem || burdenItem.hH === undefined || burdenItem.hH === null) {
                    return
                } else {
                    burdenItem.hH -= 2;
                }

                await teacher.save();
            }

            res.status(200).json({ message: "Расписание успешно удалено" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
    * Автоматическая генерация расписания на месяц
    * @swagger
    * /schedule/autoGen:
    *   post:
    *     summary: Генерировать расписание на месяц
    *     description: Автоматически создает расписание на указанный месяц.
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
    *               year:
    *                 type: integer
    *                 description: Год для создания расписания.
    *               month:
    *                 type: integer
    *                 description: Месяц для создания расписания (1-12).
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
    async generateMonthlySchedule(req: Request, res: Response) {
        try {
            const { year, month } = req.body;
            const groups = await Groups.find();

            const availableTypes = [
                'Практическая работа',
                'Лабораторная работа',
                'Зачет',
                'Экзамен'
            ];

            const daysInMonth = new Date(year, month, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);

                for (const group of groups) {
                    const scheduleItems = [];

                    const groupDisciplines = await Disciplines.find({ 'groups.item': group._id });

                    for (let i = 1; i <= 4; i++) {
                        let minBurden = Infinity;
                        let selectedDiscipline;
                        let selectedTeacher;
                        let selectedAudithoria;
                        let isTeacherAvailable = false;
                        let isAudithoriaAvailable = false; // Флаг для проверки доступности аудитории

                        // Поиск доступного учителя и дисциплины
                        for (const discipline of groupDisciplines) {
                            for (const teacherId of discipline.teachers) {
                                const teacher = await Teachers.findById(teacherId);
                                // Проверка занятости учителя на данную дату и номер пары
                                const isTeacherOccupied = await Schedule.exists({
                                    date,
                                    'items.teacher': teacherId,
                                    'items.number': i
                                });

                                if (!isTeacherOccupied) {
                                    isTeacherAvailable = true;

                                    // Поиск доступной аудитории
                                    const audithories = await Audithories.find();
                                    for (const audithoria of audithories) {
                                        const isAudithoriaOccupied = await Schedule.exists({
                                            date,
                                            'items.audithoria': audithoria._id,
                                            'items.number': i
                                        });

                                        if (!isAudithoriaOccupied) {
                                            isAudithoriaAvailable = true;
                                            selectedAudithoria = audithoria;
                                            break;
                                        }
                                    }

                                    // Вычисление нагрузки и выбор учителя
                                    const filteredTeacherBurden = teacher.burden.filter(e => e.mounth && e.mounth.getMonth() === month - 1 && e.mounth.getFullYear() === year);
                                    const filteredDisciplineBurden = discipline.groups.find(group => group.item.toString() === group._id.toString())?.burden?.filter(e => e.month && e.month.getMonth() === month - 1 && e.month.getFullYear() === year);

                                    const teacherHH = filteredTeacherBurden.length > 0 ? filteredTeacherBurden[0].hH : 0;
                                    const disciplineHH = filteredDisciplineBurden && filteredDisciplineBurden.length > 0 ? filteredDisciplineBurden[0].hH : 0;

                                    const teacherBurden = teacherHH !== 0 ? teacher.aH / teacherHH : 0;
                                    const disciplineBurden = disciplineHH !== 0 ? discipline.groups.filter(e => e.item._id === group._id)[0].aH / disciplineHH : 0;

                                    if (isAudithoriaAvailable && teacherBurden < minBurden && disciplineBurden < minBurden) {
                                        minBurden = Math.min(teacherBurden, disciplineBurden);
                                        selectedTeacher = teacher;
                                        selectedDiscipline = discipline;
                                    }
                                }
                            }
                        }

                        if (selectedDiscipline && selectedTeacher && isTeacherAvailable && isAudithoriaAvailable) {
                            const type = '664a7b904a39cebfdb541a74';

                            scheduleItems.push({
                                discipline: selectedDiscipline._id,
                                teacher: selectedTeacher._id,
                                type: type,
                                audithoria: selectedAudithoria._id,
                                number: i
                            });

                            // Добавление нагрузки для учителя
                            if (selectedTeacher.burden) {
                                const currentMonthTeacherBurdenIndex = selectedTeacher.burden.findIndex(b => b.mounth.getMonth() === month - 1 && b.mounth.getFullYear() === year);

                                if (currentMonthTeacherBurdenIndex !== -1) {
                                    selectedTeacher.burden[currentMonthTeacherBurdenIndex].hH += 2;
                                } else {
                                    selectedTeacher.burden.push({ mounth: date, hH: 2 });
                                }
                            } else {
                                selectedTeacher.burden = [{ mounth: date, hH: 2 }];
                            }

                            // Добавление нагрузки для группы в дисциплине
                            for (const group of selectedDiscipline.groups) {
                                if (group.burden) {
                                    const currentMonthGroupBurdenIndex = group.burden.findIndex(b => b.month.getMonth() === month - 1 && b.month.getFullYear() === year);

                                    if (currentMonthGroupBurdenIndex !== -1) {
                                        group.burden[currentMonthGroupBurdenIndex].hH += 2;
                                    } else {
                                        group.burden.push({ month: date, hH: 2 });
                                    }
                                } else {
                                    group.burden = [{ month: date, hH: 2 }];
                                }
                            }

                            // Сохранение изменений в учителе и дисциплине
                            await selectedTeacher.save();
                            await selectedDiscipline.save();
                        }

                    }

                    if (scheduleItems.length > 0) {
                        const newSchedule = new Schedule({
                            date,
                            group: group._id,
                            items: scheduleItems
                        });
                        console.log(newSchedule, 'Day:', day)
                        await newSchedule.save();
                    }
                }
            }

            res.status(200).json({ message: "Расписание успешно сгенерировано" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

}

export { scheduleController };
