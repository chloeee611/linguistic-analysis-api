import { Request, Response } from "express";
import { api } from "../external/analysis-api";
import sql from "../external/db";
import { processLexRare } from "../helpers/analysis.helpers";

export const postFrequency = async (req: Request, res: Response) => {
    const { search, transcripts } = req.body;

    // Forward the request to Python API
    const { data } = await api.post(`analysis/frequency`, {
        urls: transcripts,
        search,
    });

    res.status(200);
    res.json(data);
};

export const postKwal = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { project_id: projectId, search_utterance, transcripts } = req.body;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        res.json({ message: "Project ID is missing from payload" });
        return;
    }

    // Forward the request to Python API
    const { data } = await api.post(`analysis/kwal`, {
        urls: transcripts.map(({ file_url }: { file_url: string }) => file_url),
        search_utterance: [search_utterance],
    });

    // save result to DB
    const rows = await sql<{ id: number }[]>`
        INSERT INTO analyses (user_id, project_id, type, request, result)
        VALUES (${req.user.id}, ${projectId}, 'kwal', ${req.body}, ${data})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        res.status(500);
        res.json({ error: "There was an issue inserting analysis" });
        return;
    }

    for (const { id } of transcripts) {
        await sql`
            INSERT INTO analyses_transcripts (analysis_id, transcript_id)
            VALUES (${newId}, ${id})
        `;
    }

    res.status(200);
    res.json(data);
};

export const postLexRare = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { target_tier, transcripts } = req.body;

    try {
        const newId = processLexRare(
            req.user.id,
            req.body.project_id,
            target_tier,
            transcripts,
        );

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
