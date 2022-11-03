"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.getUsers = exports.getAdmin = exports.getUser = exports.changeAddress = exports.changeProfile = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
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
const checkAdmin_1 = require("../middleware/checkAdmin");
const register = async (req, res, next) => {
    const { email, password, name } = req.body;
    const user = await user_1.User.findOne({ email });
    if (user) {
        return next(new http_error_1.HttpError("Email is already used!", 400));
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const role = await role_1.Role.findOne({ role: "customer" });
    try {
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
        console.log(err);
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.User.findOne({ email });
        if (!user) {
            return next(new http_error_1.HttpError("Password or email is wrong!", 400));
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return next(new http_error_1.HttpError("Password or email is wrong!", 400));
        }
        (0, setRefreshToken_1.setRefreshToken)(res, (0, createToken_1.createRefreshToken)(user));
        const token = (0, createToken_1.createAccessToken)(user);
        res.status(201).json({
            userId: user._id.toString(),
            userName: user.name,
            accessToken: token,
        });
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
            token = await new token_1.Token({
                userId: user._id,
                token: (0, uuid_1.v4)(),
            }).save();
        }
        const link = `${process.env.FRONT_END_HOST}/password-reset/${user._id}/${token.token}`;
        await (0, sendEmail_1.sendEmail)(user.email, "Password Reset", link);
        res.status(201).json({
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
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        const token = await token_1.Token.findOne({
            userId: user._id,
            token: tokenContent,
        });
        if (!token) {
            return next(new http_error_1.HttpError("invalid link or expired token", 400));
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
const changePassword = async (req, res, next) => {
    const userId = req.userId;
    const { newPassword, oldPassword } = req.body;
    try {
        const user = await user_1.User.findById(userId);
        if (!user) {
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        const valid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!valid) {
            return next(new http_error_1.HttpError("Old password is incorrect!", 401));
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();
        res.status(201).json({ message: "Change password successfully" });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
};
exports.changePassword = changePassword;
const changeProfile = async (req, res, next) => {
    const { email, name } = req.body;
    const userId = req.userId;
    try {
        const user = await user_1.User.findById(userId);
        if (!user) {
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        if (email !== user.email) {
            const user = await user_1.User.findOne({ email });
            if (user) {
                return next(new http_error_1.HttpError("Email is already used", 400));
            }
        }
        user.email = email;
        user.name = name;
        await user.save();
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
    res.status(201).json({ message: "Edit succesfully" });
};
exports.changeProfile = changeProfile;
const changeAddress = async (req, res, next) => {
    const { city, street, country, postnumber } = req.body;
    const userId = req.userId;
    try {
        const user = await user_1.User.findById(userId);
        if (!user) {
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        user.address = { city, street, country, postnumber };
        await user.save();
        res.status(201).json({ message: "Change address successfully" });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
};
exports.changeAddress = changeAddress;
const getUser = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await user_1.User.findById(userId);
        if (!user) {
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        res.status(201).json({ user: user.toObject({ getters: true }) });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
};
exports.getUser = getUser;
const getAdmin = async (req, res, next) => {
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    const userId = req.userId;
    try {
        const user = await user_1.User.findById(userId);
        if (!user) {
            return next(new http_error_1.HttpError("There is no such user", 400));
        }
        res.status(201).json({ user: user.toObject({ getters: true }) });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
};
exports.getAdmin = getAdmin;
const getUsers = async (req, res, next) => {
    try {
        await (0, checkAdmin_1.checkAdmin)(req, res, next);
    }
    catch (err) {
        return next(err);
    }
    try {
        const { page, limit } = req.query;
        let pageLimit, currentPage;
        if (!page) {
            currentPage = 0;
        }
        else {
            currentPage = parseInt(page);
        }
        if (!limit) {
            pageLimit = 20;
        }
        else {
            pageLimit = parseInt(limit);
        }
        const roleId = await role_1.Role.find({ role: "customer" });
        const users = await user_1.User.find({ role: roleId }, "name id email role orders createAt")
            .populate("role")
            .limit(pageLimit)
            .skip(currentPage * pageLimit);
        res.status(201).json({
            users: users.map((user) => user.toObject({ getters: true })),
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured!", 500));
    }
};
exports.getUsers = getUsers;
const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { page, limit } = req.query;
        let pageLimit, currentPage;
        if (!page) {
            currentPage = 0;
        }
        else {
            currentPage = parseInt(page);
        }
        if (!limit) {
            pageLimit = 20;
        }
        else {
            pageLimit = parseInt(limit);
        }
        const user = await user_1.User.findById(userId)
            .populate({ path: "orders", options: { sort: [{ createAt: "desc" }] } })
            .limit(pageLimit)
            .skip(currentPage * pageLimit);
        if (!user) {
            return next(new http_error_1.HttpError("Cannot find user", 404));
        }
        res.status(201).json({
            orders: user.orders,
        });
    }
    catch (err) {
        return next(new http_error_1.HttpError("Some error occured", 500));
    }
};
exports.getUserOrders = getUserOrders;
//# sourceMappingURL=user-controller.js.map