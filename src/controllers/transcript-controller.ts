import {
    removeTranscriptMetadata,
    spliceTranscript,
    transcriptToArray,
} from "../helpers/transcripts.helpers";
import { generatePaginationLinksAndMeta } from "../helpers/pagination.helpers";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Transcript } from "../model/transcript.types";
import { api } from "../external/analysis-api";

import supabase from "../external/storage";
import sql from "../external/db";
import fs from "fs/promises";

export const getAllTranscripts = async (req: Request, res: Response) => {
    const transcripts = await sql<Transcript[]>`
        SELECT *
        FROM transcripts
        WHERE user_id = ${req.user.id}
    `;

    res.status(200);
    res.json(transcripts);
};

export const getTranscript = async (req: Request, res: Response) => {
    const { transcriptId } = req.params;

    if (transcriptId === undefined || Array.isArray(transcriptId)) {
        res.status(400);
        return;
    }

    const transcripts = await sql<Transcript[]>`
        SELECT *
        FROM transcripts
        WHERE id = ${transcriptId}
    `;

    res.status(200);
    res.json(transcripts[0]);
};

export const getTranscriptContent = async (req: Request, res: Response) => {
    const { transcriptId } = req.params;
    const { page = "1", pageSize = "25" } = req.query;

    if (transcriptId === undefined || Array.isArray(transcriptId)) {
        res.status(400);
        return;
    }

    const transcript = (
        await sql<Transcript[]>`
        SELECT file_url
        FROM transcripts
        WHERE id = ${transcriptId}
    `
    )[0];

    if (!transcript) {
        res.status(404);
        res.json({ message: "Transcript not found" });
        return;
    }

    const { error, data } = await supabase.storage
        .from("transcripts")
        .download(transcript.file_url);

    if (error) {
        console.error(error);
        res.status(500);
        res.json({ message: "Error retrieving transcript content" });
        return;
    }

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    const text = await data.text();

    const transcriptArray = transcriptToArray(text);
    const transcriptArrayNoMetadata = removeTranscriptMetadata(transcriptArray);
    const splicedTranscript = spliceTranscript(
        transcriptArrayNoMetadata,
        pageNumber - 1,
        pageSizeNumber,
    );

    const linksAndMetaObject = generatePaginationLinksAndMeta(
        `/transcripts/${transcriptId}/content`,
        pageNumber,
        pageSizeNumber,
        transcriptArrayNoMetadata.length,
    );

    res.status(200);
    res.json({
        content: splicedTranscript,
        ...linksAndMetaObject,
    });
};

export const getProjectTranscripts = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    const transcripts = await sql<Transcript[]>`
        SELECT *
        FROM transcripts
        INNER JOIN projects_transcripts
        ON projects_transcripts.transcript_id = transcripts.id
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

    const { error, data } = await supabase.storage
        .from("transcripts")
        .upload(`${req.user.id}/${uuidv4()}`, file);

    if (error) {
        // Handle error
        console.error(error);
        res.json(error);
        fs.unlink(req.file.path);
        return;
    }

    const { data: metadata } = await api.post(`transcript/metadata`, {
        urls: [data.path],
    });

    console.log(data);
    console.log(metadata);

    const rows = await sql<{ id: number }[]>`
        INSERT INTO transcripts (title, file_url, user_id, metadata)
        VALUES (${req.file.originalname}, ${data.path}, ${req.user.id}, ${metadata[data.path]})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        res.status(500);
        res.json({ error: "There was an issue inserting transcript" });
        fs.unlink(req.file.path);
        return;
    }

    if (projectId) {
        await sql`
            INSERT INTO projects_transcripts (project_id, transcripts_id)
            VALUES (${projectId}, ${newId})
        `;
    }

    res.status(200);
    res.json({});

    fs.unlink(req.file.path);
};
