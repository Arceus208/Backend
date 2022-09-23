"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user._id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10m",
    });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user._id.toString(), tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
};
exports.createRefreshToken = createRefreshToken;
//# sourceMappingURL=createToken.js.map