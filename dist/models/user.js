"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    tokenVersion: { type: Number, required: true },
    role: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Role" },
});
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.js.map