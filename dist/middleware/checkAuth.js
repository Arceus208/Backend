"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const http_error_1 = require("../models/http-error");
const checkAuth = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
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
        req.userId = payload.userId;
    }
    catch (err) {
        throw new http_error_1.HttpError("not authenticated", 401);
    }
    return next();
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=checkAuth.js.map