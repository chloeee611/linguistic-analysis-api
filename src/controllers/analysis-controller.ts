import { Request, Response } from "express";
import { api } from "../external/analysis-api";

import supabase from "../external/storage";
import fs from "fs/promises";

export const postAnalysis = async (req: Request, res: Response) => {
    // Upload file using standard upload
    if (!req.file?.path) {
        res.status(400);
        res.json({ message: "Invalid file" });
        return;
    }

    let file = await fs.readFile(req.file.path, "utf8");

    const { error } = await supabase.storage
        .from("transcripts")
        .upload(req.file.originalname, file);

    if (error) {
        // Handle error
        console.error(error);
        res.json(error);
    } else {
        // Handle success
        const { data } = await api.get(`analysis/${req.file.originalname}`);
        res.json(data);
    }

    await fs.unlink(req.file.path);
};
