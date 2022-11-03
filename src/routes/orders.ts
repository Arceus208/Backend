import { Router } from "express";
import { checkAdmin } from "../middleware/checkAdmin";
import {
  createOrder,
  getOrders,
  captureOrder,
  getTodaySales,
  getOrderById,
  getCurrentWeekSales,
  getMonthSales,
  getCurrentYearSales,
} from "../controllers/order-controller";
import { checkAuth } from "../middleware/checkAuth";

const router = Router();

router.get("/all", getOrders);

router.get("/todaySales", getTodaySales);

router.get("/getCurrentMonthSales", getMonthSales);

router.get("/getCurrentWeekSales", getCurrentWeekSales);

router.get("/getCurrentYearSales", getCurrentYearSales);

router.get("/:orderId", getOrderById);

router.post("/createOrder", createOrder);

router.post("/captureOrder/:orderId", captureOrder);

export default router;
