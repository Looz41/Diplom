import { Request, Response } from "express"

import {
    Teachers,
    Disciplines
} from '../../models/';

const { validationResult } = require('express-validator')

class teachersController {
    /**
     * Функция добавления нового преподавателя
     * @param req - запрос
     * @param res - ответ
     * @returns res
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

            const { id } = req.query;

            const discipline = await Disciplines.findOne({ _id: id })
                .populate('teachers')
                .exec();

            if (!discipline) {
                return res.status(404).json({ message: 'Дисциплина не найдена' });
            }

            let teachers = discipline.teachers;

            const teachersWithHH = teachers.filter((teacher: any) => teacher.hH !== undefined && teacher.hH !== 0);
            const teachersWithoutHH = teachers.filter((teacher: any) => teacher.hH === undefined || teacher.hH === 0);

            teachersWithHH.sort((a: any, b: any) => (b.aH / b.hH) - (a.aH / a.hH));

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
