"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});
exports.Admin = (0, mongoose_1.model)("Admin", adminSchema);
//# sourceMappingURL=admin.js.map