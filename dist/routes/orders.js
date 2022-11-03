"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order-controller");
const router = (0, express_1.Router)();
router.get("/all", order_controller_1.getOrders);
router.get("/todaySales", order_controller_1.getTodaySales);
router.get("/getCurrentMonthSales", order_controller_1.getMonthSales);
router.get("/getCurrentWeekSales", order_controller_1.getCurrentWeekSales);
router.get("/getCurrentYearSales", order_controller_1.getCurrentYearSales);
router.get("/:orderId", order_controller_1.getOrderById);
router.post("/createOrder", order_controller_1.createOrder);
router.post("/captureOrder/:orderId", order_controller_1.captureOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map