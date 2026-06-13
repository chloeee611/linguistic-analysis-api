import { getAllUsers, getUser, postUser } from "../controllers/user-controller";

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);

export default router;
