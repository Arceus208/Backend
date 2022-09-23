"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProduct = exports.productValidationRules = void 0;
const express_validator_1 = require("express-validator");
const productValidationRules = () => {
    return [
        (0, express_validator_1.body)("name").isString().isLength({ min: 1 }),
        (0, express_validator_1.body)("price").toFloat().isFloat({ gt: 0 }),
        (0, express_validator_1.body)("description").isString(),
        (0, express_validator_1.body)("category").isString().isIn(["cards", "box", "accessory"]),
        (0, express_validator_1.body)("quantity").toFloat().isFloat({ gt: 0 }),
    ];
};
exports.productValidationRules = productValidationRules;
const validateProduct = (req, res, next) => {
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
exports.validateProduct = validateProduct;
//# sourceMappingURL=checkProduct.js.map