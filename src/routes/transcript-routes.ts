import {
    getAllTranscripts,
    getTranscript,
    getTranscriptContent,
    getProjectTranscripts,
    postTranscript,
} from "../controllers/transcript-controller";
import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

router.get("/", getAllTranscripts);
router.get("/:transcriptId", getTranscript);
router.get("/:transcriptId/content", getTranscriptContent);
router.get("/projects/:projectId", getProjectTranscripts);
router.post("/", upload.single("uploaded_file"), postTranscript);

export default router;
