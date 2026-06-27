import { postProject, getAllProjects } from "../controllers/project-controller";
import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllProjects);
router.post("/", postProject);

export default router;
