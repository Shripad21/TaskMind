import { Router } from "express";
import {getTasks,updateTask,deleteTask,createTask} from "../controllers/taskController.js"
const router =Router();

router.get("/",getTasks);
router.post("/",createTask);
router.put("/:id",updateTask);
router.delete("/:id",deleteTask);
export default router;