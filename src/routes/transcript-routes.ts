import {
    getAllTranscripts,
    getTranscript,
    postTranscript,
} from "../controllers/transcript-controller";
import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

router.get("/", getAllTranscripts);
router.get("/:transcriptId", getTranscript);
router.post("/", upload.single("uploaded_file"), postTranscript);

export default router;
