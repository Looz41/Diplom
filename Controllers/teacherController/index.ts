import { Request, Response } from "express"

import Teachers from '../../models/Teachers/index';
import Disciplines from '../../models/Disciplines/index'

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

            // Сортируем преподавателей с hH по убыванию aH/hH
            teachersWithHH.sort((a: any, b: any) => (b.aH / b.hH) - (a.aH / a.hH));

            res.json({ teachersFree: teachersWithoutHH, teachers: teachersWithHH });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getTeacher(req: Request, res: Response) {
        try {
            const teachers = await Teachers.find()
                .exec();

            res.json({ teachers: teachers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { teachersController };
