import { Router } from "express";
import { login, register } from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/auth.js";
const userRouter= Router();

//userRouter.get("/profile",);
userRouter.post("/register",register);
userRouter.post("/login",login);
//userRouter.get("/profile", authenticateToken, getProfile);
export default userRouter;