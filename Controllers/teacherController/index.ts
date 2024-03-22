import { Request, Response } from "express"

const Teachers = require('../../models/Teachers')

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
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода' })
            }
            const { surname, name, patronymic } = req.body;
            if (!surname) {
                return res.status(400).json({ error: 'Фамилия обязательный параметр' })
            }
            if (!name) {
                return res.status(400).json({ error: 'Имя обязательный параметр' })
            }
            if (!patronymic) {
                return res.status(400).json({ error: 'Отчество обязательный параметр' })
            }

            const candidate = await Teachers.find({ surname, name, patronymic });
            if (candidate.length) {
                return res.status(411).json({ error: `Преподаватель ${surname} ${name} уже существует` })
            }
            const newTeacher = new Teachers({
                surname,
                name,
                patronymic
            });

            await newTeacher.save();

            res.json({ message: `Преподаватель ${surname} ${name} успешно создан` })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { teachersController };
