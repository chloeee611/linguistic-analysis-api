import {
    postFrequency,
    postKwal,
    postLexRare,
} from "../controllers/analysis-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.post("/frequency", postFrequency);
router.post("/kwal", postKwal);
router.post("/lexrare", postLexRare);

export default router;
