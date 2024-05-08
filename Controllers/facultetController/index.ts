import Facultets from '../../models/Facultets/index';
import Groups from '../../models/Groups/index';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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
                        as: "groups"
                    }
                },
                {
                    $unwind: "$groups"
                },
                {
                    $group: {
                        _id: {
                            facultetId: "$_id",
                            courseId: "$groups.course"
                        },
                        facultetName: { $first: "$name" },
                        course: { $first: "$groups.course" },
                        groups: { $push: { _id: "$groups._id", name: "$groups.name" } }
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
}

export { facultetController };
