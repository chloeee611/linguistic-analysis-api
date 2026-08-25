import { generatePaginationLinksAndMeta, slicePages } from "../helpers/pagination.helpers";
import { processAnalysisQuery } from "../helpers/analysis.helpers";
import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { Analysis } from "../model/analysis.types";

import sql from "../external/db";

// Gets all analyses for a user
export const getAnalyses = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { page = "1", pageSize = "25", analysisTypes } = req.query;

    if ((analysisTypes && typeof analysisTypes !== "string") || !validateParamString(projectId)) {
        res.status(400);
        res.json({ message: "Invalid params" });
        return;
    }

    // Decodes URL to handle filtering of analysis results by type
    const typesFiltered = analysisTypes ? decodeURIComponent(analysisTypes).split(",") : [];

    const typesWhere = typesFiltered.length > 0 ? sql`AND analyses.type IN ${sql(typesFiltered)}` : sql``;

    const analyses = await sql<Analysis[]>`
        SELECT id, type, created_at, COUNT(transcript_id) as transcript_count
        FROM analyses
        INNER JOIN analyses_transcripts
        ON analyses.id = analyses_transcripts.analysis_id
        WHERE user_id = ${req.user.id}
        AND project_id = ${projectId}
        ${typesWhere}
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

// Gets the results of one analysis for a user
export const getAnalysis = async (req: Request, res: Response) => {
    const { projectId, analysisId } = req.params;

    if (!validateParamString(projectId) || !validateParamString(analysisId)) {
        res.status(400);
        res.json({ message: "Input parameters are incorrect" });
        return;
    }

    const analyses = await sql<Analysis[]>`
        SELECT analyses.id, analyses.type, analyses.created_at, analyses.request, array_agg(analyses_transcripts.result) as results
        FROM analyses
        INNER JOIN analyses_transcripts
        ON analyses.id = analyses_transcripts.analysis_id
        WHERE id = ${analysisId}
        AND project_id = ${projectId}
        AND user_id = ${req.user.id}
        GROUP BY analyses.id
    `;

    if (analyses.length === 0) {
        res.status(404);
        res.json({ message: "Analysis not found" });
        return;
    }

    res.status(200);
    res.json(analyses[0]);
};

// Handles FREQ analysis
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

// Handles MLU analysis
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

// Handles KWAL analysis
export const postKwal = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { project_id, search_utterance, mor_filters, gra_filters, transcripts } = req.body;

    if (!validateParamString(project_id)) {
        res.status(400);
        res.json({ message: "Input parameters are incorrect" });
        return;
    }

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

// Handles LEXRARE analysis
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
