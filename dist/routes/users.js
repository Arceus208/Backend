"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkAuth_1 = require("../middleware/checkAuth");
const user_controller_1 = require("../controllers/user-controller");
const checkUser_1 = require("../middleware/checkUser");
const router = (0, express_1.Router)();
router.post("/register", (0, checkUser_1.userValidationRules)(), checkUser_1.validateUser, user_controller_1.register);
router.post("/login", user_controller_1.login);
router.post("/logout", user_controller_1.logout);
router.post("/forgot_password", user_controller_1.forgotPassword);
router.post("/reset_password/:userId/:token", user_controller_1.resetPassword);
router.post("/changePassword", checkAuth_1.checkAuth, user_controller_1.changePassword);
router.post("/changeProfile", checkAuth_1.checkAuth, user_controller_1.changeProfile);
router.post("/changeAddress", checkAuth_1.checkAuth, user_controller_1.changeAddress);
router.post("/change");
router.get("/getUserOrders", checkAuth_1.checkAuth, user_controller_1.getUserOrders);
router.get("/getUser", checkAuth_1.checkAuth, user_controller_1.getUser);
router.get("/getAdmin", user_controller_1.getAdmin);
router.get("/getUsers", user_controller_1.getUsers);
exports.default = router;
//# sourceMappingURL=users.js.map