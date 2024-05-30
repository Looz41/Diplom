import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import {
    Facultets,
    Groups
} from '../../models/';
const { validationResult } = require('express-validator');

class facultetController {
    /**
 * Добавление факультета
 * @swagger
 * /facultet/add:
 *   post:
 *     summary: Добавление факультета
 *     tags: [facultet]
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
 *                 description: Название факультета
 *               groups:
 *                 type: array
 *                 description: Список названий групп
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Успешное создание факультета
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   description: Флаг успешного создания
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном создании
 *       '400':
 *         description: Ошибка валидации или некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   description: Флаг ошибки
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке
 *                 errors:
 *                   type: array
 *                   description: Список ошибок валидации
 *                   items:
 *                     type: object
 *                     properties:
 *                       param:
 *                         type: string
 *                         description: Имя параметра с ошибкой
 *                       msg:
 *                         type: string
 *                         description: Текст ошибки
 *                       value:
 *                         type: string
 *                         description: Некорректное значение параметра
 *       '500':
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
    async addFacultet(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ result: false, message: 'Ошибка добавления факультета', errors: errors.array() });
                return;
            }

            const { name, groups } = req.body;

            const existingFacultet = await Facultets.findOne({ name });
            if (existingFacultet) {
                res.status(400).json({ result: false, message: `Факультет ${name} уже существует` });
                return;
            }

            const invalidGroups = groups.filter((groupName: string) => !groupName.includes('-К'));
            if (invalidGroups.length > 0) {
                res.status(400).json({ result: false, message: `Некорректные названия групп: ${invalidGroups.join(', ')}. Название группы должно содержать "-К"` });
                return;
            }

            const existingGroups = await Promise.all(groups.map(async (groupName: string) => {
                return await Groups.findOne({ name: groupName });
            }));

            if (existingGroups.some(group => group !== null)) {
                res.status(400).json({ result: false, message: `Одна или несколько групп уже существуют` });
                return;
            }

            const newFacultet = new Facultets({
                name
            });

            await newFacultet.save();

            for (const groupName of groups) {
                const newGroup = new Groups({
                    name: groupName,
                    course: groupName.split('-К')[1].slice(0, 1),
                    facultet: newFacultet._id
                });

                await newGroup.save();
            }

            res.json({ result: true, message: `Факультет ${name} был успешно создан` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
     * Редактирование факультета
     * @swagger
     * /facultet/edit:
     *   post:
     *     summary: Редактирование факультета
     *     tags: [facultet]
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
     *                 description: Уникальный идентификатор факультета
     *               name:
     *                 type: string
     *                 description: Новое название факультета
     *               groups:
     *                 type: array
     *                 description: Новый список названий групп
     *                 items:
     *                   type: string
     *     responses:
     *       '200':
     *         description: Успешное редактирование факультета
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 result:
     *                   type: boolean
     *                   description: Флаг успешного редактирования
     *                 message:
     *                   type: string
     *                   description: Сообщение об успешном редактировании
     *       '400':
     *         description: Ошибка валидации или некорректные данные
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 result:
     *                   type: boolean
     *                   description: Флаг ошибки
     *                 message:
     *                   type: string
     *                   description: Сообщение об ошибке
     *                 errors:
     *                   type: array
     *                   description: Список ошибок валидации
     *                   items:
     *                     type: object
     *                     properties:
     *                       param:
     *                         type: string
     *                         description: Имя параметра с ошибкой
     *                       msg:
     *                         type: string
     *                         description: Текст ошибки
     *                       value:
     *                         type: string
     *                         description: Некорректное значение параметра
     *       '404':
     *         description: Факультет не найден
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: Сообщение об ошибке
     *       '500':
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
    async editFacultet(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ result: false, message: 'Ошибка валидации', errors: errors.array() });
                return;
            }

            const { id, name, groups } = req.body;

            if (!id || !name || !groups) {
                res.status(400).json({ result: false, message: 'Параметры id, name и groups обязательны' });
                return;
            }

            const existingFacultet = await Facultets.findById(id);
            if (!existingFacultet) {
                res.status(404).json({ error: `Факультет с id ${id} не найден` });
                return;
            }

            existingFacultet.name = name;
            await existingFacultet.save();

            await Groups.deleteMany({ facultet: id });

            for (const groupName of groups) {
                const newGroup = new Groups({
                    name: groupName,
                    course: groupName.split('-К')[1].slice(0, 1),
                    facultet: id
                });

                await newGroup.save();
            }

            res.json({ result: true, message: `Факультет с id ${id} успешно отредактирован` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Получение списка факультетов с группами
 * @swagger
 * /facultet/get:
 *   get:
 *     summary: Получение списка факультетов с группами
 *     tags: [facultet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Успешный запрос. Возвращены факультеты с группами.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facultets:
 *                   type: array
 *                   description: Список факультетов с группами.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Идентификатор факультета.
 *                       name:
 *                         type: string
 *                         description: Название факультета.
 *                       courses:
 *                         type: array
 *                         description: Список курсов и групп факультета.
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: Название курса.
 *                             groups:
 *                               type: array
 *                               description: Список групп курса.
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     description: Идентификатор группы.
 *                                   name:
 *                                     type: string
 *                                     description: Название группы.
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
    async getFacultets(req: Request, res: Response) {
        try {
            const facultets = await Facultets.aggregate([
                {
                    $lookup: {
                        from: "groups",
                        localField: "_id",
                        foreignField: "facultet",
                        as: "groups",
                        pipeline: [
                            {
                                $group: {
                                    _id: "$course",
                                    groups: {
                                        $push: {
                                            _id: "$_id",
                                            name: "$name"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$groups",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            facultetId: "$_id",
                            courseId: "$groups._id"
                        },
                        facultetName: { $first: "$name" },
                        course: { $first: "$groups._id" },
                        groups: { $first: "$groups.groups" }
                    }
                },
                {
                    $group: {
                        _id: "$_id.facultetId",
                        name: { $first: "$facultetName" },
                        courses: {
                            $push: {
                                name: "$course",
                                groups: "$groups"
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        courses: {
                            $filter: {
                                input: "$courses",
                                as: "course",
                                cond: { $ne: ["$$course.name", null] }
                            }
                        }
                    }
                }
            ]).exec();

            res.json({ facultets: facultets });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Получение информации о факультете с группами по идентификатору
 * @swagger
 * /facultet/getOne:
 *   get:
 *     summary: Получение информации о факультете с группами по идентификатору
 *     tags: [facultet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Идентификатор факультета
 *     responses:
 *       '200':
 *         description: Успешный запрос. Возвращена информация о факультете с его группами.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facultets:
 *                   type: array
 *                   description: Информация о факультете с его группами.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Идентификатор факультета.
 *                       name:
 *                         type: string
 *                         description: Название факультета.
 *                       courses:
 *                         type: array
 *                         description: Список курсов и групп факультета.
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: Название курса.
 *                             groups:
 *                               type: array
 *                               description: Список групп курса.
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     description: Идентификатор группы.
 *                                   name:
 *                                     type: string
 *                                     description: Название группы.
 *       '400':
 *         description: Неверный запрос. Отсутствует идентификатор факультета.
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
    async getFacultet(req: Request, res: Response) {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'Не указан идентификатор факультета' });
            }

            const facultet = await Facultets.aggregate([
                {
                    $match: { _id: new ObjectId(id.toString()) }
                },
                {
                    $lookup: {
                        from: "groups",
                        localField: "_id",
                        foreignField: "facultet",
                        as: "groups"
                    }
                },
                {
                    $unwind: "$groups"
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        courses: {
                            $push: {
                                name: "$groups.course",
                                groups: { _id: "$groups._id", name: "$groups.name" }
                            }
                        }
                    }
                }
            ]).exec();

            return res.json({ facultets: facultet });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
* Удаление факультета
* @swagger
* /facultet/delete:
*   post:
*     summary: Удалить факультет
*     description: Удаляет факультет по его идентификатору
*     tags: [facultet]
 *     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: id
*         description: Идентификатор факультета, который нужно удалить
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*     responses:
*       200:
*         description: Факультет успешно удален
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение об успешном удалении аудитории
*       404:
*         description: Факультет не найден
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение о том, что факультет не был найден
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
    async deleteFacultet(req: Request, res: Response) {
        try {
            const facultettId = req.query.id;

            const existingFacultet = await Facultets.findById(facultettId);
            if (!existingFacultet) {
                return res.status(404).json({ message: "Факультет не найден" });
            }

            await Facultets.findByIdAndDelete(facultettId);

            res.status(200).json({ message: "Факультет успешно удален" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
 * Редактирование факультета
 * @swagger
 * /facultet/editGroup:
 *   post:
 *     summary: Редактирование факультета
 *     tags: [facultet]
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
 *                 description: Уникальный идентификатор группы
 *               name:
 *                 type: string
 *                 description: Новое название группы
 *     responses:
 *       '200':
 *         description: Успешное редактирование факультета
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   description: Флаг успешного редактирования
 *                 message:
 *                   type: string
 *                   description: Сообщение об успешном редактировании
 *       '400':
 *         description: Ошибка валидации или некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   description: Флаг ошибки
 *                 message:
 *                   type: string
 *                   description: Сообщение об ошибке
 *                 errors:
 *                   type: array
 *                   description: Список ошибок валидации
 *                   items:
 *                     type: object
 *                     properties:
 *                       param:
 *                         type: string
 *                         description: Имя параметра с ошибкой
 *                       msg:
 *                         type: string
 *                         description: Текст ошибки
 *                       value:
 *                         type: string
 *                         description: Некорректное значение параметра
 *       '404':
 *         description: Факультет не найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Сообщение об ошибке
 *       '500':
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
    async editGroup(req: Request, res: Response) {
        try {
            const { id, name } = req.body;

            const existingGroup = await Groups.findOne({ _id: id });
            if (!existingGroup) {
                return res.status(404).json({ error: "Группа не найденв" });
            }

            existingGroup.name = name;
            await existingGroup.save()

            res.status(200).json({ message: "Факультет успешно удален" });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

        /**
* Удаление факультета
* @swagger
* /facultet/deleteGroup:
*   post:
*     summary: Удалить группу
*     description: Удаляет группу по его идентификатору
*     tags: [facultet]
 *     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: id
*         description: Идентификатор группу, который нужно удалить
*         required: true
*         schema:
*           type: string
*           format: ObjectId
*     responses:
*       200:
*         description: Группа успешно удалена
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение об успешном удалении группы
*       404:
*         description: Группа не найдена
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   description: Сообщение о том, что группа не был найдена
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
async deleteGroup(req: Request, res: Response) {
    try {
        const groupId = req.query.id;

        const existingGroup = await Groups.findOne({_id: groupId});
        if (!existingGroup) {
            return res.status(404).json({ message: "Группа не найдена" });
        }

        await Groups.findByIdAndDelete(existingGroup);

        res.status(200).json({ message: "Группа успешно удалена" });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}
}

export { facultetController };
