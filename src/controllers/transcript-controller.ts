import {
    compileTranscript,
    removeTranscriptMetadata,
    sliceTranscript,
    transcriptToArray,
} from "../helpers/transcripts.helpers";
import { generatePaginationLinksAndMeta } from "../helpers/pagination.helpers";
import { processAnalysisQuery } from "../helpers/analysis.helpers";
import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Transcript } from "../model/transcript.types";
import { api } from "../external/analysis-api";

import supabase from "../external/storage";
import sql from "../external/db";
import fs from "fs/promises";

export const getAllTranscripts = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!validateParamString(projectId)) {
        res.status(400);
        return;
    }

    const transcripts = await sql<Transcript[]>`
        SELECT id, title, file_url, created_at, user_id, project_id, metadata
        FROM transcripts
        WHERE user_id = ${req.user.id}
        AND project_id = ${projectId}
    `;

    res.status(200);
    res.json(transcripts);
};

export const getTranscript = async (req: Request, res: Response) => {
    const { projectId, transcriptId } = req.params;

    if (!validateParamString(transcriptId) || !validateParamString(projectId)) {
        res.status(400);
        return;
    }

    const transcripts = await sql<Transcript[]>`
        SELECT id, title, file_url, created_at, user_id, project_id, metadata
        FROM transcripts
        WHERE id = ${transcriptId}
        AND user_id= ${req.user.id}
        AND project_id = ${projectId}
    `;

    res.status(200);
    res.json(transcripts[0]);
};

export const getTranscriptContent = async (req: Request, res: Response) => {
    const { projectId, transcriptId } = req.params;
    const { page = "1", pageSize = "25" } = req.query;

    if (!validateParamString(transcriptId) || !validateParamString(projectId)) {
        res.status(400);
        return;
    }

    const transcript = (
        await sql<Transcript[]>`
        SELECT parsed_content
        FROM transcripts
        WHERE id = ${transcriptId}
        AND user_id= ${req.user.id}
        AND project_id = ${projectId}
    `
    )[0];

    if (!transcript) {
        res.status(404);
        res.json({ message: "Transcript not found" });
        return;
    }

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    const parsedContent = transcript.parsed_content;

    if (!parsedContent) {
        res.status(200);
        res.json({ message: "No Parsed Content Found" });
        return;
    }

    const slicedContent = sliceTranscript(parsedContent, pageNumber - 1, pageSizeNumber);

    const linksAndMetaObject = generatePaginationLinksAndMeta(
        `/transcripts/${transcriptId}/content`,
        pageNumber,
        pageSizeNumber,
        parsedContent.length,
    );

    res.status(200);
    res.json({
        content: slicedContent,
        ...linksAndMetaObject,
    });
};

export const postTranscript = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!validateParamString(projectId)) {
        res.status(400);
        return;
    }

    // Upload file using standard upload
    if (!req.file?.path) {
        res.status(400);
        res.json({ message: "Invalid file" });
        return;
    }

    let file = await fs.readFile(req.file.path, "utf8");

    const { error, data } = await supabase.storage.from("transcripts").upload(`${req.user.id}/${uuidv4()}`, file);

    // TODO: make all async queries run at once

    const transcriptArray = transcriptToArray(file);
    const transcriptArrayNoMetadata = removeTranscriptMetadata(transcriptArray);
    const compiledTranscript = compileTranscript(transcriptArrayNoMetadata);

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

    const rows = await sql<{ id: number }[]>`
        INSERT INTO transcripts (title, file_url, user_id, metadata, parsed_content, project_id)
        VALUES (${req.file.originalname}, ${data.path}, ${req.user.id}, ${metadata[data.path]}, ${compiledTranscript}, ${projectId})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        res.status(500);
        res.json({ error: "There was an issue inserting transcript" });
        fs.unlink(req.file.path);
        return;
    }

    try {
        const transcriptObject = [{ id: newId, file_url: data.path }];

        const lexRarePromise = processAnalysisQuery("lexrare", req.user.id, projectId, transcriptObject);
        const mluPromise = processAnalysisQuery("mlu", req.user.id, projectId, transcriptObject);
        const frqPromise = processAnalysisQuery("freq", req.user.id, projectId, transcriptObject);

        await Promise.all([lexRarePromise, mluPromise, frqPromise]);
    } catch (err) {
        res.status(500);
        res.json({ error: err });
        return;
    }

    res.status(200);
    res.json({ id: newId });

    fs.unlink(req.file.path);
};
