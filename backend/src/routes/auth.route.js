

import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controller/auth.controller.js";
import { uploadImage } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", uploadImage.single("photo"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
