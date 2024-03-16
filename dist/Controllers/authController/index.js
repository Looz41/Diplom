"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationValidationRules = exports.authController = void 0;
var config_1 = require("../../config");
var User = require('../../models/User/user');
var Role = require('../../models/User/role');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var validationResult = require('express-validator').validationResult;
var body = require('express-validator').body;
var generateAccesstoken = function (id, roles) {
    var payload = {
        id: id,
        roles: roles
    };
    return jwt.sign(payload, config_1.SecretKey.secret, { expiresIn: '24h' });
};
var authController = /** @class */ (function () {
    function authController() {
    }
    /**
     * Функция регистрации Нового Пользователя
     * @param req - запрос
     * @param res - ответ
     * @returns res
     */
    authController.prototype.registration = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, _a, username, password, candidate, hashPassword, userRole, user, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        errors = validationResult(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, res.status(400).json({ message: 'Ошибка при регистрации', errors: errors })];
                        }
                        _a = req.body, username = _a.username, password = _a.password;
                        return [4 /*yield*/, User.findOne({ username: username })];
                    case 1:
                        candidate = _b.sent();
                        if (candidate) {
                            return [2 /*return*/, res.status(400).json({ message: 'Пользователь с таким именем уже существует' })];
                        }
                        hashPassword = bcrypt.hashSync(password, 7);
                        return [4 /*yield*/, Role.findOne({ value: 'ADMIN' })];
                    case 2:
                        userRole = _b.sent();
                        user = new User({ username: username, password: hashPassword, roles: [userRole.value] });
                        return [4 /*yield*/, user.save()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, res.json({ message: 'Пользователь был успешно зарегестрирован' })];
                    case 4:
                        e_1 = _b.sent();
                        console.log(e_1);
                        res.status(400).json({ message: 'Registration error' });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    authController.prototype.login = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, password, user, validPassword, token, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, username = _a.username, password = _a.password;
                        return [4 /*yield*/, User.findOne({ username: username })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(400).json({ message: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(username, " \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442") })];
                        }
                        validPassword = bcrypt.compareSync(password, user.password);
                        if (!validPassword) {
                            return [2 /*return*/, res.status(400).json({ message: "\u0412\u0432\u0435\u0434\u0435\u043D \u043D\u0435 \u0432\u0435\u0440\u043D\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })];
                        }
                        token = generateAccesstoken(user._id, user.roles);
                        return [2 /*return*/, res.json({ token: token })];
                    case 2:
                        e_2 = _b.sent();
                        console.log(e_2);
                        res.status(400).json({ message: 'Login error' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    authController.prototype.getUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var users, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, User.find()];
                    case 1:
                        users = _a.sent();
                        res.json(users);
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return authController;
}());
exports.authController = authController;
// Валидация полей "Имя" и "Пароль" при регистрации
var registrationValidationRules = [
    body('username').trim().notEmpty().withMessage('Имя пользователя не должно быть пустым'),
    body('password').trim().isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];
exports.registrationValidationRules = registrationValidationRules;
//# sourceMappingURL=index.js.map