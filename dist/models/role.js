"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = require("mongoose");
const roleSchema = new mongoose_1.Schema({
    role: { type: String, required: true, enum: ["admin", "customer"] },
});
exports.Role = (0, mongoose_1.model)("Role", roleSchema);
//# sourceMappingURL=role.js.map