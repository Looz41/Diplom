import { Request, Response } from 'express';

const Discipline = require('../../models/Disciplines')
const Groups = require('../../models/Groups')

const { validationResult } = require('express-validator')

interface MongooseValidationError {
    message: string;
}

class disciplineController {
    /**
     * Функция добавления новой дисциплины
     * @param req - запрос
     * @param res - ответ
     * @returns res
     */
    async getDiscipline(req, res) {
        try {
            const disciplines = await Discipline.find()
            res.json({ disciplines })
        } catch (e) {
            console.log(e)
        }
    }

    async getDisciplineByName(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Название дисциплины не может быть пустым', errors })
            }
            const { name } = req.body
            if (!name) {
                return res.status(400).json({ message: 'Название дисциплины не может быть пустым' })
            }
            const discipline = await Discipline.findOne({ name })
            if (discipline === null) {
                return res.status(411).json({ error: 'Дисциплины с данным названием не существует' })
            }
            res.json({ discipline })
        } catch (e) {
            console.log(e)
        }
    }

    async getDisciplineByGroup(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Название группы не может быть пустым' })
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Название группы не может быть пустым' })
            }
            const group = await Groups.findOne({ name })
            if (group === null) {
                return res.status(411).json({ error: 'Группы с данным названием не существует' })
            }
            res.json({ disciplines: group.disciplines })
        } catch (e) {
            console.log(e)
        }
    }

    async addDiscipline(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка добавления дисциплины', errors: errors.array() });
            }
            const { name, facultet, teachers } = req.body;
            const candidate = await Discipline.findOne({ name });
            if (candidate) {
                return res.status(400).json({ error: `Дисциплина |${name}| уже существует` });
            }
            const discipline = new Discipline({ name, facultet, teachers });
            await discipline.validate();
            await discipline.save();
            return res.json({ message: `Дисциплина |${name}| была успешно создана.` });
        } catch (e) {
            if (e.errors) {
                const errorMessages: string[] = Object.values(e.errors).map((error: MongooseValidationError) => error.message);
                return res.status(400).json({ message: 'Ошибка добавления дисциплины', errors: errorMessages });
            }
            console.log(e);
            return res.status(400).json({ message: 'Discipline add error' });
        }
    }
}

export { disciplineController };
