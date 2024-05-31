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
      *         required: false
      *         schema:
      *           type: string
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
      *                       groups:
      *                         type: array
      *                         items:
      *                           type: object
      *                           properties:
      *                             item:
      *                               type: object
      *                               properties:
      *                                 _id:
      *                                   type: string
      *                                   description: Уникальный идентификатор группы.
      *                                 name:
      *                                   type: string
      *                                   description: Название группы.
      *                             aH:
      *                               type: number
      *                               description: Значение AH.
      *                             burden:
      *                               type: array
      *                               items:
      *                                 type: number
      *                       pc:
      *                         type: boolean
      *                         description: ПК.
      *       500:
      *         description: Ошибка сервера. Возникает в случае проблем на стороне сервера.
      *         content:
      *           application/json:
      *             schema:
      *               type: object
      *               properties:
      *                 message:
      *                   type: string
      *                   description: Сообщение об ошибке сервера.
      */
    async getDiscipline(req: Request, res: Response) {
        try {
            let query: QueryType = {};

            if (typeof req.query.groupId === 'string') {
                query['groups.item'] = req.query.groupId;
            }

            const disciplines = await Disciplines.find(query)
                .select('_id name groups pc teachers')
                .populate('groups.item', 'name')
                .populate('teachers', 'surname name patronymic')
                .exec();

            const formattedDisciplines = disciplines.map(discipline => ({
                id: discipline._id,
                name: discipline.name,
                groups: discipline.groups,
                teachers: discipline.teachers,
                pc: discipline.pc
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

    /**
 * @swagger
 * /discipline/addGroupToDiscipline:
 *   post:
 *     summary: Добавление группы в дисциплину
 *     tags: [Disciplines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disciplineId:
 *                 type: string
 *                 description: Идентификатор дисциплины
 *                 example: "60d21b4667d0d8992e610c85"
 *               groupId:
 *                 type: string
 *                 description: Идентификатор группы
 *                 example: "60d21b4867d0d8992e610c86"
 *               aH:
 *                 type: number
 *                 description: Значение AH
 *                 example: 42
 *               burden:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     month:
 *                       type: string
 *                       format: date
 *                       description: Месяц
 *                       example: "2023-05-31"
 *                     hH:
 *                       type: number
 *                       description: Значение HH
 *                       example: 10
 *     responses:
 *       200:
 *         description: Группа успешно добавлена в дисциплину
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном добавлении группы в дисциплину
 *                 discipline:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           item:
 *                             type: string
 *                           aH:
 *                             type: number
 *       400:
 *         description: Ошибка в запросе. Группа уже существует в дисциплине или группа/дисциплина не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
    async addGroupToDiscipline(req: Request, res: Response) {
        try {
            const { disciplineId, groupId, aH } = req.body;

            const discipline = await Disciplines.findById(disciplineId);
            if (!discipline) {
                return res.status(404).json({ error: "Дисциплина не найдена" });
            }

            const group = await Groups.findById(groupId);
            if (!group) {
                return res.status(404).json({ error: "Группа не найдена" });
            }

            const groupExists = discipline.groups.some(g => g.item.toString() === groupId);
            if (groupExists) {
                return res.status(400).json({ error: "Группа уже добавлена в дисциплину" });
            }

            discipline.groups.push({ item: groupId, aH });
            await discipline.save();

            res.status(200).json({ message: "Группа успешно добавлена в дисциплину", discipline });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * @swagger
 * /discipline/deleteGroupFromDiscipline:
 *   post:
 *     summary: Удаление группы из дисциплины
 *     tags: [Disciplines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disciplineId:
 *                 type: string
 *                 description: Идентификатор дисциплины
 *                 example: "60d21b4667d0d8992e610c85"
 *               groupId:
 *                 type: string
 *                 description: Идентификатор группы
 *                 example: "60d21b4867d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Группа успешно удалена из дисциплины
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном удалении группы из дисциплины
 *                 discipline:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           item:
 *                             type: string
 *                           aH:
 *                             type: number
 *                           burden:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 month:
 *                                   type: string
 *                                   format: date
 *                                 hH:
 *                                   type: number
 *       404:
 *         description: Дисциплина или группа не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
    async deleteGroupFromDiscipline(req: Request, res: Response) {
        try {
            const { disciplineId, groupId } = req.body;

            const discipline = await Disciplines.findById(disciplineId);
            if (!discipline) {
                return res.status(404).json({ error: "Дисциплина не найдена" });
            }

            const groupIndex = discipline.groups.findIndex(g => g._id.toString() === groupId);
            if (groupIndex === -1) {
                return res.status(404).json({ error: "Группа не найдена в дисциплине" });
            }

            discipline.groups.splice(groupIndex, 1);
            await discipline.save();

            res.status(200).json({ message: "Группа успешно удалена из дисциплины", discipline });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * @swagger
 * /discipline/addTeacherToDiscipline:
 *   post:
 *     summary: Добавление учителя к дисциплине
 *     tags: [Disciplines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disciplineId:
 *                 type: string
 *                 description: Идентификатор дисциплины
 *                 example: "60d21b4667d0d8992e610c85"
 *               teacherId:
 *                 type: string
 *                 description: Идентификатор учителя
 *                 example: "60d21b4867d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Успешное добавление учителя к дисциплине
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном добавлении учителя к дисциплине
 *                 discipline:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     teachers:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Учитель уже добавлен в дисциплину
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Дисциплина или учитель не найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
    async addTeacherToDiscipline(req: Request, res: Response) {
        try {
            const { disciplineId, teacherId } = req.body;

            const discipline = await Disciplines.findById(disciplineId);
            if (!discipline) {
                return res.status(404).json({ error: "Дисциплина не найдена" });
            }

            const teacherExists = discipline.teachers.some(t => t.toString() === teacherId);
            if (teacherExists) {
                return res.status(400).json({ error: "Преподаватель уже добавлен в дисциплину" });
            }

            discipline.teachers.push(teacherId);
            await discipline.save();

            res.status(200).json({ message: "Преподаватель успешно добавлен в дисциплину", discipline });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * @swagger
 * /discipline/deleteTeacherFromDiscipline:
 *   post:
 *     summary: Удаление учителя из дисциплины
 *     tags: [Disciplines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disciplineId:
 *                 type: string
 *                 description: Идентификатор дисциплины
 *                 example: "60d21b4667d0d8992e610c85"
 *               teacherId:
 *                 type: string
 *                 description: Идентификатор учителя
 *                 example: "60d21b4867d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Успешное удаление учителя из дисциплины
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном удалении учителя из дисциплины
 *                 discipline:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     teachers:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Дисциплина или учитель не найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
    async deleteTeacherFromDiscipline(req: Request, res: Response) {
        try {
            const { disciplineId, teacherId } = req.body;

            const discipline = await Disciplines.findById(disciplineId);
            if (!discipline) {
                return res.status(404).json({ error: "Дисциплина не найдена" });
            }

            const groupIndex = discipline.teachers.findIndex(g => g._id.toString() === teacherId);
            if (groupIndex === -1) {
                return res.status(404).json({ error: "Преподаватель не найден в дисциплине" });
            }

            discipline.teachers.splice(groupIndex, 1);
            await discipline.save();

            res.status(200).json({ message: "Преподаватель успешно удален из дисциплины", discipline });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

export { disciplineController };
