"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
var start = function () {
    try {
        app.listen(PORT, function () { return console.log("Running on portttt ".concat(PORT)); });
    }
    catch (e) {
        console.warn(e);
    }
};
start();
//# sourceMappingURL=index.js.map