import Facultets from '../../models/Facultets/index';
import Groups from '../../models/Groups/index';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
const { validationResult } = require('express-validator');

class facultetController {
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

            const invalidGroups = groups.filter(groupName => !groupName.includes('-К'));
            if (invalidGroups.length > 0) {
                res.status(400).json({ result: false, message: `Некорректные названия групп: ${invalidGroups.join(', ')}. Название группы должно содержать "-К"` });
                return;
            }

            const existingGroups = await Promise.all(groups.map(async (groupName) => {
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

            res.json({ result: true, message: `Факультет ${name} был успешно создан 😊` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }




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
