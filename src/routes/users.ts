import { Router } from "express";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/user-controller";

import { userValidationRules, validateUser } from "../middleware/checkUser";

const router = Router();

router.post("/register", userValidationRules(), validateUser, register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/forgot_password", forgotPassword);

router.post("/reset_password/:userId/:token", resetPassword);

export default router;
