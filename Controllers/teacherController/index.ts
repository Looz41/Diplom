import { Request, Response } from "express"

import {
    Teachers,
    Disciplines
} from '../../models/';

const { validationResult } = require('express-validator')

class teachersController {


    /**
 * Добавление преподавателя
 * @swagger
 * /teacher/add:
 *   post:
 *     summary: Добавить преподавателя
 *     description: Создает нового преподавателя.
 *     tags: [teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surname:
 *                 type: string
 *                 description: Фамилия преподавателя.
 *               name:
 *                 type: string
 *                 description: Имя преподавателя.
 *               patronymic:
 *                 type: string
 *                 description: Отчество преподавателя.
 *               aH:
 *                 type: number
 *                 description: Общее количество часов.
 *     responses:
 *       '200':
 *         description: Успешное создание преподавателя.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение о успешном создании преподавателя.
 *       '400':
 *         description: Ошибка ввода или недостаточно параметров.
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
 *                       msg:
 *                         type: string
 *                         description: Сообщение об ошибке.
 *                       param:
 *                         type: string
 *                         description: Параметр, вызвавший ошибку.
 *                       location:
 *                         type: string
 *                         description: Местоположение ошибки.
 *       '409':
 *         description: Преподаватель уже существует.
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
    async addTeacher(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода', errors: errors.array() });
            }

            const { surname, name, patronymic, aH } = req.body;

            if (!surname || !aH) {
                return res.status(400).json({ error: 'Параметры |Фамилия| и |Общее кол-во часов| обязательны' });
            }

            const existingTeacher = await Teachers.findOne({ surname, name, patronymic });
            if (existingTeacher) {
                return res.status(409).json({ error: `Преподаватель ${surname} ${name} уже существует` });
            }

            const newTeacher = new Teachers({ surname, name, patronymic, aH });
            await newTeacher.save();

            res.json({ message: `Преподаватель ${surname} ${name} успешно создан` });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Редактирование преподавателя
     * @swagger
     * /teacher/edit:
     *   post:
     *     summary: Редактирование преподавателя
     *     description: Обновляет информацию о существующем преподавателе.
     *     tags: [teachers]
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
     *                 description: Уникальный идентификатор преподавателя.
     *               surname:
     *                 type: string
     *                 description: Новая фамилия преподавателя.
     *               name:
     *                 type: string
     *                 description: Новое имя преподавателя.
     *               patronymic:
     *                 type: string
     *                 description: Новое отчество преподавателя.
     *               aH:
     *                 type: number
     *                 description: Новое общее количество часов.
     *     responses:
     *       '200':
     *         description: Успешное обновление информации о преподавателе.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об успешном обновлении информации о преподавателе.
     *       '400':
     *         description: Ошибка в запросе или недостаточно параметров.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке в запросе.
     *       '404':
     *         description: Преподаватель не найден.
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
    async editTeacher(req: Request, res: Response) {
        try {
            const { id, surname, name, patronymic, aH } = req.body;

            if (!id || (!surname && !name && !patronymic && !aH)) {
                return res.status(400).json({ message: 'Параметры id и хотя бы один из полей: surname, name, patronymic, aH обязательны' });
            }

            const existingTeacher = await Teachers.findById(id);
            if (!existingTeacher) {
                return res.status(404).json({ error: `Преподаватель с id ${id} не найден` });
            }

            existingTeacher.surname = surname;
            existingTeacher.name = name;
            existingTeacher.patronymic = patronymic;
            existingTeacher.aH = aH;

            await existingTeacher.save();

            res.status(200).json({ message: "Информация о преподавателе успешно обновлена" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Получение преподавателей по дисциплине
     * @swagger
     * /teacher/getTeacherByDiscipline:
     *   get:
     *     summary: Получение преподавателей по дисциплине
     *     tags: [teachers]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Идентификатор дисциплины
     *     responses:
     *       '200':
     *         description: Успешный запрос. Возвращены преподаватели с учебной нагрузкой и без неё.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 teachers:
     *                   type: array
     *                   description: Преподаватели с учебной нагрузкой (HH > 0), отсортированные по убыванию aH/hH.
     *                 teachersFree:
     *                   type: array
     *                   description: Преподаватели без учебной нагрузки (HH = 0 или не определено).
     *       '400':
     *         description: Неверный запрос. Отсутствует идентификатор дисциплины.
     *       '404':
     *         description: Дисциплина с указанным идентификатором не найдена.
     *       '500':
     *         description: Ошибка сервера.
     */
    async getTeacherByDiscipline(req: Request, res: Response) {
        try {
            if (!req.query || !req.query.id) {
                return res.status(400).json({ message: 'Идентификатор дисциплины не указан' });
            }

            const { id, date } = req.query;

            const discipline = await Disciplines.findOne({ _id: id })
                .populate('teachers')
                .exec();

            if (!discipline) {
                return res.status(404).json({ message: 'Дисциплина не найдена' });
            }

            const teachers: (typeof Teachers & { aH: number, burden: { hH?: number; mounth?: Date; }[] })[] = (discipline.teachers as unknown) as (typeof Teachers & { aH: number, burden: { hH?: number; mounth?: Date; }[] })[];

            const teachersWithHH = teachers.filter(teacher => {
                const filtered = teacher.burden.filter(e => e.mounth?.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }) === new Date(date as string).toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }));
                return filtered.length > 0 && filtered[0].hH !== undefined && filtered[0].hH !== 0;
            });

            const teachersWithoutHH = teachers.filter(teacher => {
                const filtered = teacher.burden.filter(e => e.mounth?.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }) === new Date(date as string).toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }));
                return filtered.length === 0 || filtered[0].hH === undefined || filtered[0].hH === 0;
            });

            teachersWithHH.sort((a, b) => {
                const bHH = b.burden.filter((e: any) => e.mounth?.toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' }) === new Date(date as string).toLocaleDateString('ru-Ru', { month: 'numeric', year: 'numeric' })).reduce((acc: any, cur: any) => acc + cur.hH, 0);
                const aHH = a.burden.reduce((acc: any, cur: any) => acc + cur.hH, 0);
                return (b.aH / bHH) - (a.aH / aHH);
            });

            res.json({ teachers: [...teachersWithoutHH, ...teachersWithHH] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Получение информации о учителе(ях) с их дисциплинами
     * @swagger
     * /teacher/get:
     *   get:
     *     summary: Получение информации о учителе(ях) с их дисциплинами
     *     tags: [teachers]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: string
     *         description: Идентификатор учителя (необязательный). Если не указан, будут возвращены все учителя.
     *     responses:
     *       '200':
     *         description: Успешный запрос. Возвращена информация о учителе(ях) с их дисциплинами.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 teachers:
     *                   type: array
     *                   description: Список учителей с их дисциплинами.
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         description: Идентификатор учителя.
     *                       name:
     *                         type: string
     *                         description: Имя учителя.
     *                       surname:
     *                         type: string
     *                         description: Фамилия учителя.
     *                       patronymic:
     *                         type: string
     *                         description: Отчество учителя.
     *                       aH:
     *                         type: number
     *                         description: aH учителя.
     *                       hH:
     *                         type: number
     *                         description: hH учителя.
     *                       disciplines:
     *                         type: array
     *                         description: Список дисциплин, преподаваемых учителем.
     *                         items:
     *                           type: object
     *                           properties:
     *                             _id:
     *                               type: string
     *                               description: Идентификатор дисциплины.
     *                             name:
     *                               type: string
     *                               description: Название дисциплины.
     *       '404':
     *         description: Учитель с указанным идентификатором не найден.
     *       '500':
     *         description: Ошибка сервера.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке сервера.
     */
    async getTeacher(req: Request, res: Response) {
        try {
            const { id: teacherId } = req.query;

            let teachers;
            if (teacherId) {
                const teacher = await Teachers.findById(teacherId).exec();
                if (!teacher) {
                    return res.status(404).json({ message: 'Учитель с указанным идентификатором не найден' });
                }
                teachers = [teacher];
            } else {
                teachers = await Teachers.find().exec();
            }

            const teachersWithDisciplines = await Promise.all(teachers.map(async (teacher) => {
                const disciplines = await Disciplines.find({ teachers: teacher._id }).select('_id name').exec();

                return {
                    id: teacher._id,
                    name: teacher.name,
                    surname: teacher.surname,
                    patronymic: teacher.patronymic,
                    aH: teacher.aH,
                    hH: teacher.hH,
                    disciplines: disciplines
                };
            }));

            res.json({ teachers: teachersWithDisciplines });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { teachersController };
