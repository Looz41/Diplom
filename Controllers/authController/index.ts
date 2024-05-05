import { Request, Response } from "express"
import { SecretKey } from "../../config"

const User = require('../../models/User/user')
const Role = require('../../models/User/role')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const { body } = require('express-validator');

const generateAccesstoken = (id: string, roles: Array<string>) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, SecretKey.secret, { expiresIn: '24h' })
}

class authController {

    /**
    * Регистрация нового пользователя
    * @swagger
    * /auth/registration:
    *   post:
    *     summary: Регистрация нового пользователя
    *     tags: [auth]
    *     description: Регистрация нового пользователя
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               username:
    *                 type: string
    *               password:
    *                 type: string
    *             required:
    *               - username
    *               - password
    */
    async registration(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при регистрации', errors })
            }
            const { username, password } = req.body
            const candidate = await User.findOne({ username })
            if (candidate) {
                return res.status(400).json({ message: 'Пользователь с таким именем уже существует' })
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({ value: 'USER' });
            if (!userRole) {
                return res.status(400).json({ message: 'Роль не найдена' });
            }
            const user = new User({ username, password: hashPassword, roles: [userRole.value] })
            await user.save()
            return res.json({ message: 'Пользователь был успешно зарегестрирован' })
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Registration error' })
        }
    }

    /**
   * Авторизация пользователя
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Авторизация пользователя
   *     tags: [auth]
   *     description: Авторизация пользователя
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *             required:
   *               - username
   *               - password
   *     responses:
   *       200:
   *         description: Успешная авторизация, возврат токена
   *       400:
   *         description: Ошибка при авторизации
   */
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body
            const user = await User.findOne({ username })
            if (!user) {
                return res.status(400).json({ message: `Пользователь ${username} не существует` })
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен не верный пароль` })
            }
            const token = generateAccesstoken(user._id, user.roles)
            return res.json({ token })
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Login error' })
        }
    }

    /**
    * Получение списка пользователей
    * @swagger
    * tags:
    *      name: auth
    * /auth/users:
    *   get:
    *     summary: Получение списка пользователей
    *     tags: [auth]
    *     description: Получение списка пользователей
    *     responses:
    *       200:
    *         description: Список пользователей
    */
    async getUsers(req: Request, res: Response) {
        try {
            const users = await User.find()
            res.json(users)
        } catch (e) {

        }
    }

    async addRole(req: Request, res: Response) {
        try {
            const userRole = new Role();
            const adminRole = new Role({ value: "ADMIN" });
            await userRole.save();
            await adminRole.save();
            res.json('Ok')
        } catch (e) {
            console.log(e);
        }
    }
}

// Валидация полей "Имя" и "Пароль" при регистрации
const registrationValidationRules = [
    body('username').trim().notEmpty().withMessage('Имя пользователя не должно быть пустым'),
    body('password').trim().isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];

export { authController, registrationValidationRules };
