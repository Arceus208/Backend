"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user-controller");
const checkUser_1 = require("../middleware/checkUser");
const router = (0, express_1.Router)();
router.post("/register", (0, checkUser_1.userValidationRules)(), checkUser_1.validateUser, user_controller_1.register);
router.post("/login", user_controller_1.login);
router.post("/logout", user_controller_1.logout);
router.post("/forgot_password", user_controller_1.forgotPassword);
router.post("/reset_password/:userId/:token", user_controller_1.resetPassword);
exports.default = router;
//# sourceMappingURL=users.js.map