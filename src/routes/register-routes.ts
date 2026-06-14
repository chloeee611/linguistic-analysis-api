import { postRegister } from "../controllers/register-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.post("/", postRegister);

export default router;
