import { cancelTask, getAllTasks, getTask } from "../controllers/task-controller";

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllTasks);
router.get("/:taskId", getTask);
router.put("/:taskId/cancel", cancelTask);

export default router;
