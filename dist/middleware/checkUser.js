"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.userValidationRules = void 0;
const express_validator_1 = require("express-validator");
const userValidationRules = () => {
    return [
        (0, express_validator_1.body)("name").isString().isLength({ min: 5 }),
        (0, express_validator_1.body)("email").isEmail(),
        (0, express_validator_1.body)("password").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/),
    ];
};
exports.userValidationRules = userValidationRules;
const validateUser = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    const error = (0, express_validator_1.validationResult)(req);
    if (error.isEmpty()) {
        return next();
    }
    const extratedErrors = [];
    error.array().map((err) => extratedErrors.push({ [err.param]: err.msg }));
    return res.status(422).json({ errors: extratedErrors });
};
exports.validateUser = validateUser;
//# sourceMappingURL=checkUser.js.map