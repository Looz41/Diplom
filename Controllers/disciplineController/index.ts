import { Request, Response } from 'express';

import {
    Disciplines,
    Groups,
    Teachers,
} from '../../models/'
import { ObjectId } from 'mongodb';

const { validationResult } = require('express-validator')

interface MongooseValidationError {
    message: string;
}

class disciplineController {

    /**
     * Добавление дисциплины
     * @swagger
     * /discipline/add:
     *   post:
     *     summary: Добавление дисциплины
     *     tags:
     *       - disciplines
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
     *                 description: Название дисциплины.
     *               groups:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Список названий групп, к которым относится дисциплина.
     *               teachers:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Список фамилий преподавателей, преподающих дисциплину.
     *               aH:
     *                 type: number
     *                 description: Количество академических часов.
     *     responses:
     *       200:
     *         description: Успешное добавление дисциплины.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об успешном добавлении дисциплины.
     *       400:
     *         description: Ошибка запроса. Возникает в случае неверных данных в запросе.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке добавления дисциплины.
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       param:
     *                         type: string
     *                         description: Имя параметра, содержащего ошибку.
     *                       msg:
     *                         type: string
     *                         description: Сообщение об ошибке.
     *                       value:
     *                         type: any
     *                         description: Значение параметра, содержащего ошибку.
     *       500:
     *         description: Ошибка сервера. Возникает в случае проблем на стороне сервера.
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

    /**
 * Редактирование дисциплины
 * @swagger
 * /discipline/edit:
 *   put:
 *     summary: Редактирование дисциплины
 *     tags:
 *       - disciplines
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
 *                 description: Уникальный идентификатор дисциплины.
 *               name:
 *                 type: string
 *                 description: Новое название дисциплины.
 *               groups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Новый список названий групп, к которым относится дисциплина.
 *               teachers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Новый список фамилий преподавателей, преподающих дисциплину.
 *               aH:
 *                 type: number
 *                 description: Новое количество академических часов.
 *     responses:
 *       200:
 *         description: Успешное редактирование дисциплины.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном редактировании дисциплины.
 *       400:
 *         description: Ошибка запроса. Возникает в случае неверных данных в запросе.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Сообщение об ошибке.
 *       404:
 *         description: Дисциплина не найдена.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Сообщение об ошибке.
 *       500:
 *         description: Ошибка сервера. Возникает в случае проблем на стороне сервера.
 */
async editDiscipline(req: Request, res: Response) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Ошибка запроса', errors: errors.array() });
        }

        const { id, name, groups, teachers, aH } = req.body;

        if (!id || !name || !groups || !teachers || !aH) {
            return res.status(400).json({ error: 'Параметры id, name, groups, teachers и aH обязательны' });
        }

        const existingDiscipline = await Disciplines.findById(id);
        if (!existingDiscipline) {
            return res.status(404).json({ error: `Дисциплина с id ${id} не найдена` });
        }

        existingDiscipline.name = name;
        existingDiscipline.groups = groups;
        existingDiscipline.teachers = teachers;
        existingDiscipline.aH = aH;
        await existingDiscipline.save();

        res.json({ message: `Дисциплина с id ${id} успешно отредактирована` });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}

    /**
  * Получение списка дисциплин
  * @swagger
  * /discipline/get:
  *   get:
  *     summary: Получение списка дисциплин
  *     tags:
  *       - disciplines
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Успешный запрос. Возвращает список дисциплин.
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 disciplines:
  *                   type: array
  *                   items:
  *                     type: object
  *                     properties:
  *                       id:
  *                         type: string
  *                         description: Уникальный идентификатор дисциплины.
  *                       name:
  *                         type: string
  *                         description: Название дисциплины.
  *       500:
  *         description: Ошибка сервера. Возникает в случае проблем на стороне сервера.
  */
    async getDiscipline(req: Request, res: Response) {
        try {
            const disciplines = await Disciplines.find()
                .select('_id name')
                .exec();

            const formattedDisciplines = disciplines.map(discipline => ({
                id: discipline._id,
                name: discipline.name
            }));

            res.json({ disciplines: formattedDisciplines });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

}

export { disciplineController };
