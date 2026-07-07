import {
    postProject,
    getAllProjects,
    getProject,
} from "../controllers/project-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllProjects);
router.get("/:projectId", getProject);
router.post("/", postProject);

export default router;
