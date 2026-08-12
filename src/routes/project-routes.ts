import {
    postProject,
    getAllProjects,
    getProject,
    getProjectDashboard,
    getProjectChildren,
    putProject,
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
router.get("/:projectId/children", getProjectChildren);
router.get("/:projectId/dashboard", getProjectDashboard);
router.post("/", postProject);
router.put("/:projectId", putProject);

router.get("/:projectId/transcripts", getAllTranscripts);
router.get("/:projectId/transcripts/:transcriptId", getTranscript);
router.get("/:projectId/transcripts/:transcriptId/content", getTranscriptContent);
router.post("/:projectId/transcripts", upload.array("uploaded_file"), postTranscript);

export default router;
