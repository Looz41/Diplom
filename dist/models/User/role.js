"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var Role = new mongoose_1.Schema({
    value: { type: String, unique: true, default: "USER" },
});
module.exports = (0, mongoose_1.model)("Role", Role);
//# sourceMappingURL=role.js.map