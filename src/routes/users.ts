import { Router } from "express";
import { checkAuth } from "../middleware/checkAuth";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  getUser,
  changeProfile,
  changePassword,
  changeAddress,
  getUsers,
  getUserOrders,
  getAdmin,
} from "../controllers/user-controller";

import { userValidationRules, validateUser } from "../middleware/checkUser";
import { checkAdmin } from "../middleware/checkAdmin";

const router = Router();

router.post("/register", userValidationRules(), validateUser, register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot_password", forgotPassword);

router.post("/reset_password/:userId/:token", resetPassword);

router.post("/changePassword", checkAuth, changePassword);

router.post("/changeProfile", checkAuth, changeProfile);

router.post("/changeAddress", checkAuth, changeAddress);

router.post("/change");

router.get("/getUserOrders", checkAuth, getUserOrders);

router.get("/getUser", checkAuth, getUser);
router.get("/getAdmin", getAdmin);

router.get("/getUsers", getUsers);

export default router;
