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
        SELECT transcripts.id, transcripts.title, transcripts.file_url, transcripts.created_at, transcripts.user_id, transcripts.project_id, transcripts.metadata, transcripts.child_id, children.name as child_name
        FROM transcripts
        LEFT JOIN children
        ON transcripts.child_id = children.id
        WHERE transcripts.user_id = ${req.user.id}
        AND transcripts.project_id = ${projectId}
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
        SELECT transcripts.id, transcripts.title, transcripts.file_url, transcripts.created_at, transcripts.user_id, transcripts.project_id, transcripts.metadata, transcripts.child_id, children.name as child_name
        FROM transcripts
        LEFT JOIN children
        ON transcripts.child_id = children.id
        WHERE transcripts.id = ${transcriptId}
        AND transcripts.user_id= ${req.user.id}
        AND transcripts.project_id = ${projectId}
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
        parsedContent.length
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
    if (!Array.isArray(req.files)) {
        res.status(400);
        res.json({ message: "Invalid files" });
        return;
    }

    // Cast to 'never' is required due to this issue: https://github.com/porsager/postgres/issues/958
    const task = await sql<{ id: number }[]>`
            INSERT INTO tasks (type, status, user_id, content)
            VALUES ('transcript_upload', 'running', ${req.user.id}, ${{ transcriptsCompleted: 0, totalTranscripts: req.files.length } as never})
            RETURNING id
        `;

    const taskId = task[0]?.id;

    if (!taskId) {
        res.status(500);
        res.json({ message: "Failed to create task" });
        return;
    }

    res.status(202);
    res.contentType("application/json");
    res.location(`/tasks/${taskId}`);
    res.json({ message: "Task created", location: `/tasks/${taskId}` });

    let transcriptsCompleted: number = 0;

    for (const file of req.files) {
        let fileUtf = await fs.readFile(file.path, "utf8");

        const { error, data } = await supabase.storage
            .from("transcripts")
            .upload(`${req.user.id}/${uuidv4()}`, fileUtf);

        if (error) {
            // Handle error
            console.error(error);
            await sql<{ id: number }[]>`
                UPDATE tasks 
                SET status = 'failed', content = ${error.message}
                WHERE id = ${taskId}
            `;
            await fs.unlink(file.path);
            return;
        }

        const transcriptArray = transcriptToArray(fileUtf);
        const transcriptArrayNoMetadata = removeTranscriptMetadata(transcriptArray);
        const compiledTranscript = compileTranscript(transcriptArrayNoMetadata);

        const { data: metadata } = await api.post(`transcript/metadata`, {
            urls: [{ file_url: data.path, id: data.id }],
        });

        const rows = await sql<{ id: number }[]>`
            INSERT INTO transcripts (title, file_url, user_id, metadata, parsed_content, project_id, child_id)
            VALUES (${file.originalname}, ${data.path}, ${req.user.id}, ${metadata[data.id]}, ${compiledTranscript}, ${projectId}, ${req.body.child_id})
            RETURNING id
        `;

        const newId = rows[0]?.id;

        if (newId === undefined) {
            const error = { errorMessage: "There was an issue inserting transcript" };

            await sql<{ id: string }[]>`
                UPDATE tasks 
                SET status = 'failed', content = ${{ error } as never}
                WHERE id = ${taskId}
            `;
            await fs.unlink(file.path);
            return;
        }

        try {
            const transcriptObject = [{ id: newId, file_url: data.path }];

            const lexRarePromise = processAnalysisQuery("lexrare", req.user.id, projectId, transcriptObject, {
                target_tier: "mor",
            });
            const mluPromise = processAnalysisQuery("mlu", req.user.id, projectId, transcriptObject);
            const frqPromise = processAnalysisQuery("freq", req.user.id, projectId, transcriptObject);

            await Promise.all([lexRarePromise, mluPromise, frqPromise]);
        } catch (error) {
            const errorMessage =
                error && typeof error === "object" && "message" in error && typeof error.message === "string"
                    ? error.message
                    : "";

            await sql<{ id: number }[]>`
                UPDATE tasks 
                SET status = 'failed', content = ${{ errorMessage } as never}
                WHERE id = ${taskId}
            `;
            await fs.unlink(file.path);
            return;
        }

        transcriptsCompleted += 1;

        await sql<{ id: number }[]>`
            UPDATE tasks 
            SET content = ${{ transcriptsCompleted, totalTranscripts: req.files.length } as never}
            WHERE id = ${taskId}`;

        await fs.unlink(file.path);
    }

    await sql<{ id: number }[]>`
            UPDATE tasks 
            SET status = 'success', content = ${{ transcriptsCompleted, totalTranscripts: req.files.length } as never}
            WHERE id = ${taskId}`;
};
