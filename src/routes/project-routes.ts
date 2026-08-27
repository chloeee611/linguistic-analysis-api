import {
    postProject,
    getAllProjects,
    getProject,
    getProjectDashboard,
    getProjectChildren,
    putProject,
} from "../controllers/project-controller";
import {
    deleteTranscript,
    getAllTranscripts,
    getTranscript,
    getTranscriptContent,
    postTranscript,
} from "../controllers/transcript-controller";
import { getAnalyses, getAnalysis } from "../controllers/analysis-controller";

import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

// Projects
router.get("/", getAllProjects);
router.get("/:projectId", getProject);
router.get("/:projectId/children", getProjectChildren);
router.get("/:projectId/dashboard", getProjectDashboard);
router.post("/", postProject);
router.put("/:projectId", putProject);

// Transcripts
router.get("/:projectId/transcripts", getAllTranscripts);
router.get("/:projectId/transcripts/:transcriptId", getTranscript);
router.get("/:projectId/transcripts/:transcriptId/content", getTranscriptContent);
router.post("/:projectId/transcripts", upload.array("uploaded_file"), postTranscript);
router.delete("/:projectId/transcripts/:transcriptId", deleteTranscript);

// Analysis
router.get("/:projectId/analysis", getAnalyses);
router.get("/:projectId/analysis/:analysisId", getAnalysis);

export default router;
