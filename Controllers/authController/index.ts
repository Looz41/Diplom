import { NextFunction, Request, Response } from "express"
import { isEmail } from "class-validator"
const mailService = require('../../service/mailService');
const userService = require('../../service/userService');
require('dotenv').config();
const User = require('../../models/User/user')
const Role = require('../../models/User/role')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const { validationResult } = require('express-validator')

const { body } = require('express-validator');

const generateAccessToken = (id: string, roles: Array<string>) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, process.env.SECRETKEY, { expiresIn: '24h' })
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
    *               mail:
    *                 type: string
    *                 fornat: email
    *               password:
    *                 type: string
    *             required:
    *               - mail
    *               - password
    *     responses:
    *       200:
    *         description: Успешная регистрация, возврат токена
    *       400:
    *         description: Ошибка при регистрации
    */
    async registration(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка при регистрации', errors: errors.array() });
            }

            const { mail, password } = req.body;
            if (!isEmail(mail)) {
                return res.status(400).json({ error: `${mail} - не является адресом электронной почты` });
            }

            const candidate = await User.findOne({ mail });
            if (candidate) {
                return res.status(400).json({ error: 'Пользователь с таким адресом уже существует' });
            }

            const hashPassword = bcrypt.hashSync(password, 7);
            const activationLink = uuid.v4();

            const userRole = await Role.findOne({ value: 'USER' });
            if (!userRole) {
                return res.status(400).json({ message: 'Роль не найдена' });
            }
            const user = new User({ mail, password: hashPassword, roles: [userRole.value], activationLink });

            await mailService.sendActivationMail(mail, `${process.env.SITEURL}/backend/auth/activate/${activationLink}`);

            await user.save();

            return res.json({ message: 'Код подтверждения успешно отправлен' });

        } catch (e) {
            console.error('Ошибка при регистрации:', e);
            return res.status(500).json({ message: 'Ошибка при регистрации' });
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
            const user = await User.findOne({ mail: username })
            if (!user) {
                return res.status(400).json({ message: `Пользователь ${username} не существует` })
            }
            if (!user.isActivated) {
                return res.status(403).json({ message: 'Адрес электронной почты не подтвержден' })
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: `Введен не верный пароль` })
            }
            const token = generateAccessToken(user._id, user.roles);
            const { roles: userRoles } = jwt.verify(token, process.env.SECRETKEY) as { roles: string[] };
            userRoles.forEach((role: string) => {
                if (["ADMIN"].includes(role)) {
                    return res.json({ user: { token, role: "ADMIN" } })
                } else if (["USER"].includes(role)) {
                    return res.json({ user: { token, role: "USER" } })
                } else {
                    return res.json({ user: { token, role: "null" } })
                }
            });
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
 *     security:
 *       - bearerAuth: []
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
            res.status(400).json({ error: 'Ошибка' })
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

    /**
    * Проверка авторизации пользователя
    * @swagger
    * tags:
    *      name: auth
    * /auth/check:
    *   get:
    *     summary: Проверка авторизации пользователя
    *     tags: [auth]
    *     security:
    *       - bearerAuth: []
    *     description: Проверка авторизации пользователя
    *     responses:
    *       200:
    *         description: Список пользователей
    */
    async checkToken(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Отсутствует токен авторизации' });
            }

            const { roles: userRoles } = jwt.verify(token, process.env.SECRETKEY) as { roles: string[] };

            userRoles.forEach((role: string) => {
                if (["ADMIN"].includes(role)) {
                    return res.json({ user: { status: "Ok", role: "ADMIN" } })
                } else if (["USER"].includes(role)) {
                    return res.json({ user: { status: "Ok", role: "USER" } })
                } else {
                    return res.json({ user: { status: "Ok", role: "null" } })
                }
            });

        } catch (error) {
            return res.status(403).json({ message: 'Недействительный токен' });
        }
    }

    async activate(req: Request, res: Response) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.SITEURL);

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    /**
* Восстановление пароля
* @swagger
* /auth/restore:
*   post:
*     summary: Восстановление пароля
*     tags: [auth]
*     description: Восстановление пароля
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
*               newPassword:
*                 type: string
*             required:
*               - username
*               - password
*               - newPassword
*     responses:
*       200:
*         description: Пароль успешно обновлен
*       400:
*         description: Ошибка при обновлении пароля
*/
    async restore(req: Request, res: Response) {
        try {
            const { username, password, newPassword } = req.body;

            if (!username || !password || !newPassword) {
                return res.status(400).json({ message: 'Пожалуйста, предоставьте все необходимые данные' });
            }

            const user = await User.findOne({ mail: username });

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Неверный текущий пароль' });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 7);

            user.password = hashedNewPassword;
            await user.save();

            return res.status(200).json({ message: 'Пароль успешно обновлен' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

const registrationValidationRules = [
    body('username').trim().notEmpty().withMessage('Имя пользователя не должно быть пустым'),
    body('password').trim().isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];

export { authController, registrationValidationRules };
