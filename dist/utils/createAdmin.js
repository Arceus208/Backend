"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = void 0;
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const role_1 = require("../models/role");
const createAdmin = async () => {
    try {
        const password = "admin";
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const role = await role_1.Role.findOne({ role: "admin" });
        const newUser = new user_1.User({
            name: "manh le",
            email: "admin@admin.com",
            password: hashedPassword,
            tokenVersion: Math.random(),
            role: role === null || role === void 0 ? void 0 : role._id,
        });
        await newUser.save();
    }
    catch (err) {
        console.log(err);
    }
};
exports.createAdmin = createAdmin;
//# sourceMappingURL=createAdmin.js.map