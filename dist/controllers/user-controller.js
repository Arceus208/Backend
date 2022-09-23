"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const http_error_1 = require("../models/http-error");
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = require("jsonwebtoken");
const setRefreshToken_1 = require("../utils/setRefreshToken");
const createToken_1 = require("../utils/createToken");
const token_1 = require("../models/token");
const uuid_1 = require("uuid");
const sendEmail_1 = require("../utils/sendEmail");
const role_1 = require("../models/role");
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const user = await user_1.User.findOne({ email });
        if (user) {
            return next(new http_error_1.HttpError("Email is already used!", 422));
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const role = await role_1.Role.findOne({ role: "customer" });
        const newUser = new user_1.User({
            name,
            email,
            password: hashedPassword,
            tokenVersion: Math.random(),
            role: role === null || role === void 0 ? void 0 : role._id,
        });
        await newUser.save();
        res.status(201).json({ user: newUser });
    }
    catch (err) {
        next(new http_error_1.HttpError("An error occured", 500));
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.User.findOne({ email });
        if (!user) {
            return next(new http_error_1.HttpError("Password or email is wrong!", 422));
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return next(new http_error_1.HttpError("Password or email is wrong!", 422));
        }
        (0, setRefreshToken_1.setRefreshToken)(res, (0, createToken_1.createRefreshToken)(user));
        const token = (0, createToken_1.createAccessToken)(user);
        res.status(201).json({ user: user._id.toString(), accessToken: token });
    }
    catch (err) {
        next(new http_error_1.HttpError("An error occured", 500));
    }
};
exports.login = login;
const logout = async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
        (0, setRefreshToken_1.setRefreshToken)(res, "");
        return res.json({ message: "logout" });
    }
    let payload;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        (0, setRefreshToken_1.setRefreshToken)(res, "");
        return res.json({ message: "logout" });
    }
    const user = await user_1.User.findById(payload.userId);
    if (!user) {
        (0, setRefreshToken_1.setRefreshToken)(res, "");
        return res.json({ message: "logout" });
    }
    user.tokenVersion = Math.random();
    (0, setRefreshToken_1.setRefreshToken)(res, "");
    return res.status(201).json({ message: "logout" });
};
exports.logout = logout;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await user_1.User.findOne({ email });
        if (!user) {
            return res.json({
                message: "Password reset link was sent to your email account",
            });
        }
        let token = await token_1.Token.findOne({ userId: user._id });
        if (!token) {
            token = await new token_1.Token({
                userId: user._id,
                token: (0, uuid_1.v4)(),
            }).save();
        }
        else {
            await token.delete();
            token = token = await new token_1.Token({
                userId: user._id,
                token: (0, uuid_1.v4)(),
            }).save();
        }
        const link = `${process.env.FRONT_END_HOST}/password-reset/${user._id}/${token.token}`;
        await (0, sendEmail_1.sendEmail)(user.email, "Password Reset", link);
        res.json({
            message: "Password reset link was sent to your email account",
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("An error occured", 500));
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const userId = req.params.userId;
        const tokenContent = req.params.token;
        const user = await user_1.User.findById(userId);
        if (!user) {
            return res.json("There is no such user");
        }
        const token = await token_1.Token.findOne({
            userId: user._id,
            token: tokenContent,
        });
        if (!token) {
            return res.json("invalid link or expired token");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        user.password = hashedPassword;
        await user.save();
        await token.delete();
        return res.json({ message: "Password reset successfully" });
    }
    catch (err) {
        return next(new http_error_1.HttpError("An error occured", 500));
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=user-controller.js.map