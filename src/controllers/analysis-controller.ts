import { processAnalysisQuery } from "../helpers/analysis.helpers";
import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { Analysis } from "../model/analysis.types";

import sql from "../external/db";
import { generatePaginationLinksAndMeta, slicePages } from "../helpers/pagination.helpers";

export const getAnalyses = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { page = "1", pageSize = "25" } = req.query;

    if (!validateParamString(projectId)) {
        res.status(400);
        return;
    }

    const analyses = await sql<Analysis[]>`
        SELECT id, type, created_at, COUNT(transcript_id) as transcript_count
        FROM analyses
        INNER JOIN analyses_transcripts
        ON analyses.id = analyses_transcripts.analysis_id
        WHERE user_id = ${req.user.id}
        AND project_id = ${projectId}
        GROUP BY id, type
    `;

    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);

    const slicedContent = slicePages(analyses, pageNumber - 1, pageSizeNumber);

    const linksAndMetaObject = generatePaginationLinksAndMeta(
        `/projects/${projectId}/analysis`,
        pageNumber,
        pageSizeNumber,
        analyses.length
    );

    res.status(200);
    res.json({ results: slicedContent, ...linksAndMetaObject });
};

export const postFreq = async (req: Request, res: Response) => {
    const { project_id, search, transcripts } = req.body;

    try {
        const newId = await processAnalysisQuery("freq", req.user.id, project_id, search, transcripts);

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

export const postMlu = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { transcripts } = req.body;

    try {
        const newId = await processAnalysisQuery("mlu", req.user.id, req.body.project_id, transcripts);

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

export const postKwal = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { project_id, search_utterance, mor_filters, gra_filters, transcripts } = req.body;

    try {
        const newId = await processAnalysisQuery("kwal", req.user.id, project_id, transcripts, {
            search_utterance,
            mor_filters,
            gra_filters,
        });

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

export const postLexRare = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { target_tier, transcripts } = req.body;

    try {
        const newId = await processAnalysisQuery("lexrare", req.user.id, req.body.project_id, transcripts, {
            target_tier,
        });

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
