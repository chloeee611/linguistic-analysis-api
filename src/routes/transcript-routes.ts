import {
    getTranscript,
    postTranscript,
} from "../controllers/transcript-controller";
import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId", getTranscript);
router.post("/", upload.single("uploaded_file"), postTranscript);

export default router;
