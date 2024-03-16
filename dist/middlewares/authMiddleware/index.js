"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../../config");
var jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        var token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Пользователь не авторизован' });
        }
        var decodedData = jwt.verify(token, config_1.SecretKey.secret);
        req.user = decodedData;
        next();
    }
    catch (e) {
        console.log(e);
        return res.status(403).json({ message: 'Пользователь не авторизован' });
    }
};
//# sourceMappingURL=index.js.map