import { ObjectId } from 'mongodb';
import Facultets from '../../models/Facultets/index';
import Groups from '../../models/Groups/index';
import Audithories from '../../models/Audithories/index';
import { Request, Response } from 'express';
const { validationResult } = require('express-validator');

class facultetController {
    async addFacultet(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ result: false, message: 'Ошибка добавления факультета', errors: errors.array() });
                return;
            }

            const { name, groups, audithories } = req.body;

            const existingFacultet = await Facultets.findOne({ name });
            if (existingFacultet) {
                res.status(400).json({ result: false, message: `Факультет ${name} уже существует` });
                return;
            }

            const savedGroups = [];
            for (const groupName of groups) {
                let existingGroup = await Groups.findOne({ name: groupName });

                if (!existingGroup) {
                    const groupObject = new Groups({ name: groupName });
                    existingGroup = await groupObject.save();
                }

                savedGroups.push(existingGroup._id);
            }

            const courses = [];
            for (const group of groups) {
                const courseNumber = group.split('-К')[1].slice(0, 1);
                let existingCourse = courses.find(course => course.name === courseNumber);

                if (!existingCourse) {
                    existingCourse = { name: courseNumber, groups: [] };
                    courses.push(existingCourse);
                }

                const groupObject = await Groups.findOne({ name: group });
                if (groupObject) {
                    existingCourse.groups.push(groupObject._id);
                }
            }

            const savedAudithories = [];
            for (const audithoryName of audithories) {
                let existingAudithory = await Audithories.findOne({ name: audithoryName });

                if (!existingAudithory) {
                    const audithoryObject = new Audithories({ name: audithoryName });
                    existingAudithory = await audithoryObject.save();
                }

                savedAudithories.push(existingAudithory._id);
            }

            const newFacultet = new Facultets({
                name,
                courses: courses.map(course => ({
                    name: course.name,
                    groups: course.groups.map(groupId => new ObjectId(groupId))
                })),
                audithories: savedAudithories
            });

            await newFacultet.save();

            res.json({ result: true, message: `Факультет ${name} был успешно создан 😊` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getFacultets(req, res) {
        try {
            const facultets = await Facultets.find()
                .populate({
                    path: 'courses',
                    populate: {
                        path: 'groups',
                        model: 'Groups'
                    }
                })
                .populate('audithories')
                .exec();
            res.json({ facultets });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: 'Ошибка при получении факультетов' });
        }
    }

    async getFacultet(req, res) {

        console.log(req.query.id)

        try {
            const facultet = await Facultets.findOne({_id : req.query.id})
                .populate({
                    path: 'courses',
                    populate: {
                        path: 'groups',
                        model: 'Groups'
                    }
                })
                .populate('audithories')
                .exec();
            res.json({ facultet: [facultet] });
        } catch (e) {
            console.log(e);
            res.status(500).json({ error: 'Ошибка при получении факультетов' });
        }
    }
}

export { facultetController };
