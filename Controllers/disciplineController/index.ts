import { Request, Response } from 'express';

import Disciplines from '../../models/Disciplines/index'
import Groups from '../../models/Groups/index';
import Teachers from '../../models/Teachers/index';

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

    async addDiscipline(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка добавления дисциплины', errors: errors.array() });
            }

            const { name, groups, teachers, aH } = req.body;

            // Получаем ID групп по их именам
            const groupsIds = [];
            for (const groupName of groups) {
                let group = await Groups.findOne({ name: groupName });


                // Если группа не найдена, создаем новую
                if (!group) {
                    group = new Groups({ name: groupName });
                    await group.save();
                }

                groupsIds.push(group._id);
            }

            const teachersIds = [];
            for (const teacherName of teachers) {
                let teacher = await Teachers.findOne({ surname: teacherName });

                if (!teacher) {
                    teacher = new Teachers({ surname: teacherName, aH: 100 });
                    await teacher.save();
                }

                teachersIds.push(teacher._id);
            }

            const existingDiscipline = await Disciplines.findOne({ name });
            if (existingDiscipline) {
                return res.status(400).json({ error: `Дисциплина ${name} уже существует` });
            }

            const discipline = new Disciplines({ name, groups: groupsIds, teachers: teachersIds, aH });
            await discipline.save();

            return res.json({ message: `Дисциплина ${name} была успешно создана.` });
        } catch (error) {
            console.error('Ошибка:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getDiscipline(req: Request, res: Response) {
        try {
            const disciplines = await Disciplines.find()
                .populate('groups')
                .populate('teachers')
                .exec();

            res.json({ disciplines: disciplines });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

}

export { disciplineController };