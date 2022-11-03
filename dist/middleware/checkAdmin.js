"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../models/user");
const http_error_1 = require("../models/http-error");
const role_1 = require("../models/role");
const checkAdmin = async (req) => {
    if (req.method === "OPTIONS") {
        return;
    }
    const authorization = req.headers["authorization"];
    if (!authorization) {
        throw new http_error_1.HttpError("not authenticated", 401);
    }
    try {
        const token = authorization.split(" ")[1];
        const payload = (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        if (!payload) {
            throw new http_error_1.HttpError("not authenticated", 401);
        }
        const user = await user_1.User.findById(payload.userId);
        if (!user) {
            throw new http_error_1.HttpError("not authenticated", 401);
        }
        const roleId = user.role;
        const roleEntity = await role_1.Role.findById(roleId);
        if (!roleEntity) {
            throw new http_error_1.HttpError("not authenticated", 401);
        }
        if (roleEntity.role !== "admin") {
            throw new http_error_1.HttpError("not authenticated", 401);
        }
        req.userId = payload.userId;
    }
    catch (err) {
        throw new http_error_1.HttpError("not authenticated", 401);
    }
};
exports.checkAdmin = checkAdmin;
//# sourceMappingURL=checkAdmin.js.map