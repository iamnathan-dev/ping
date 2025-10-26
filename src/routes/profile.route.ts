import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";

const router = Router();
const profileController = new ProfileController();

router.post("/create", profileController.createProfile.bind(profileController));
router.get(
  "/get/:user_id",
  profileController.getProfile.bind(profileController)
);

export default router;
