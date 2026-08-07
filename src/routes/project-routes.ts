import {
    postProject,
    getAllProjects,
    getProject,
    getProjectSummary,
} from "../controllers/project-controller";
import {
    getAllTranscripts,
    getTranscript,
    getTranscriptContent,
    postTranscript,
} from "../controllers/transcript-controller";

import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

router.get("/", getAllProjects);
router.get("/:projectId", getProject);
router.get("/:projectId/summary", getProjectSummary);
router.post("/", postProject);

router.get("/:projectId/transcripts", getAllTranscripts);
router.get("/:projectId/transcripts/:transcriptId", getTranscript);
router.get("/:projectId/transcripts/:transcriptId/content", getTranscriptContent);
router.post("/:projectId/transcripts", upload.single("uploaded_file"), postTranscript);

export default router;
