import {
    getAllUsers,
    getMe,
    getUser,
    putUserDetails,
} from "../controllers/user-controller";

import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", getAllUsers);
router.get("/me", getMe);
router.get("/:id", getUser);
router.put("/:id", putUserDetails);

export default router;
