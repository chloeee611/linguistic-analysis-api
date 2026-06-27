import { postTranscript } from "../controllers/transcript-controller";
import express from "express";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router({ mergeParams: true });

router.post("/", upload.single("uploaded_file"), postTranscript);

export default router;
