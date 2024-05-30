import { Request, Response } from 'express';

import {
    Disciplines,
    Groups,
    Teachers,
} from '../../models/'

const { validationResult } = require('express-validator')

interface QueryType {
    'groups.item'?: string;
}

class disciplineController {

    /**
     * @openapi
     * /discipline/add:
     *   post:
     *     summary: Создать новую дисциплину
     *     description: Создает новую дисциплину с указанными параметрами.
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
     *                 description: Название дисциплины
     *               groups:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     groupName:
     *                       type: string
     *                       description: Название группы
     *                     aH:
     *                       type: number
     *                       description: Количество часов аудиторных занятий
     *               teachers:
     *                 type: array
     *                 items:
     *                   type: string
     *                   description: ФИО преподавателя
     *                 description: Список преподавателей, преподающих дисциплину
     *               pc:
     *                 type: boolean
     *                 description: Флаг наличия ПК для проведения занятий
     *     responses:
     *       '200':
     *         description: Дисциплина успешно создана
     *       '400':
     *         description: Неверный запрос, дисциплина уже существует или некорректные данные
     *       '404':
     *         description: Группа или преподаватель не найдены
     *       '500':
     *         description: Ошибка сервера
     */
    async addDiscipline(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка добавления дисциплины', errors: errors.array() });
            }

            const { name, groups, teachers, pc } = req.body;

            const groupsWithIds = [];
            for (const groupItem of groups) {
                const { groupName, aH } = groupItem;
                const group = await Groups.findOne({ name: groupName });

                if (!group) {
                    return res.status(404).json({ message: `Группа ${groupName} не найдена` });
                }

                groupsWithIds.push({ item: group._id, aH });
            }

            const teachersIds = [];
            for (const teacherName of teachers) {
                const [surname, name, patronymic] = teacherName.split(" ");
                const teacher = await Teachers.findOne({ surname, name, patronymic });

                if (!teacher) {
                    return res.status(404).json({ message: `Преподаватель ${teacherName} не найден` });
                }

                teachersIds.push(teacher._id);
            }

            const existingDiscipline = await Disciplines.findOne({ name });
            if (existingDiscipline) {
                return res.status(400).json({ error: `Дисциплина ${name} уже существует` });
            }

            const discipline = new Disciplines({ name, groups: groupsWithIds, teachers: teachersIds, pc: pc || false });
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
 *   post:
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
 *               pc:
 *                 type: boolean
 *                 description: ПК.
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

            const { id, name, pc } = req.body;

            if (!id || !name) {
                return res.status(400).json({ error: 'Параметры id, name и pc обязательны' });
            }

            const existingDiscipline = await Disciplines.findById(id);
            if (!existingDiscipline) {
                return res.status(404).json({ error: `Дисциплина с id ${id} не найдена` });
            }

            existingDiscipline.name = name;
            existingDiscipline.pc = pc;
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
  *     parameters:
  *       - in: query
  *         name: groupId
  *         description: Идентификатор группы для получения её возможных дисциплин
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
            let query: QueryType = {};

            if (typeof req.query.groupId === 'string') {
                query['groups.item'] = req.query.groupId;
            }

            const disciplines = await Disciplines.find(query)
                .select('_id name groups')
                .populate('groups.item', 'name')
                .exec();

            const formattedDisciplines = disciplines.map(discipline => ({
                id: discipline._id,
                name: discipline.name,
                groups: discipline.groups,
            }));

            res.json({ disciplines: formattedDisciplines });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
* Удаление дисциплины
* @swagger
* /discipline/delete:
*   post:
*     summary: Удалить дисциплину
*     description: Удаляет дисциплины по её идентификатору
  *     tags:
  *       - disciplines
   *     security:
 *       - bearerAuth: []
*     parameters:
*       - in: query
*         name: id
*         description: Идентификатор дисциплины, которую нужно удалить
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*     responses:
*       200:
*         description: Дисциплина успешно удалена
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение об успешном удалении дисциплины
*       404:
*         description: Дисциплина не найдена
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение о том, что дисциплина не была найдена
*       500:
*         description: Внутренняя ошибка сервера
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение об ошибке сервера
*/
    async deleteDiscipline(req: Request, res: Response) {
        try {
            const disciplineId = req.query.id;

            const existingDiscipline = await Disciplines.findById(disciplineId);
            if (!existingDiscipline) {
                return res.status(404).json({ message: "Дисциплина не найдена" });
            }

            await Disciplines.findByIdAndDelete(disciplineId);

            res.status(200).json({ message: "Дисциплина успешно удалена" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { disciplineController };
