import { postLogin } from "../controllers/login-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.post("/", postLogin);

export default router;
