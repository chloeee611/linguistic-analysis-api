import { postFrequency } from "../controllers/analysis-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.post("/frequency/:transcriptName", postFrequency);

export default router;
