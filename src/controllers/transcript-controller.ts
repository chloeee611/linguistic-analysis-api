import { Request, Response } from "express";
// import { api } from "../external/analysis-api";

import supabase from "../external/storage";
import sql from "../external/db";
import fs from "fs/promises";
import { Transcript } from "../model/transcript.types";

export const getTranscript = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    const transcripts = await sql<Transcript[]>`
        SELECT *
        FROM transcripts
        WHERE project_id = ${projectId}
    `;

    res.status(200);
    res.json(transcripts);
};

export const postTranscript = async (req: Request, res: Response) => {
    const { projectId } = req.body;

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
        // const { data } = await api.get(`analysis/${req.file.originalname}`);
        res.json({ message: "Upload successful" });
    }

    await sql`
    INSERT INTO transcripts (project_id, title, file_url)
    VALUES (${projectId}, ${req.file.originalname}, ${req.file.originalname})
    `;

    await fs.unlink(req.file.path);
};
