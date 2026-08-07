import {
    postProject,
    getAllProjects,
    getProject,
    linkTranscriptsToProject,
    getProjectSummary,
} from "../controllers/project-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllProjects);
router.get("/:projectId", getProject);
router.get("/:projectId/summary", getProjectSummary);
router.post("/", postProject);
router.post("/:projectId/transcripts", linkTranscriptsToProject);

export default router;
