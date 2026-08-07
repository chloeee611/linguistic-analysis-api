import { postFreq, postKwal, postLexRare, postMlu } from "../controllers/analysis-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.post("/freq", postFreq);
router.post("/kwal", postKwal);
router.post("/lexrare", postLexRare);
router.post("/mlu", postMlu);

export default router;
