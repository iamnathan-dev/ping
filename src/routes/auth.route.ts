import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/verify-email", authController.verifyEmail.bind(authController));
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController)
);

export default router;
