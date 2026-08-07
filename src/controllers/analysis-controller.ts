import { processAnalysisQuery } from "../helpers/analysis.helpers";
import { Request, Response } from "express";

export const postFreq = async (req: Request, res: Response) => {
    const { project_id, search, transcripts } = req.body;

    try {
        const newId = processAnalysisQuery("freq", req.user.id, project_id, search, transcripts);

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
        const newId = processAnalysisQuery("mlu", req.user.id, req.body.project_id, transcripts);

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

export const postKwal = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { project_id, search_utterance, transcripts } = req.body;

    try {
        const newId = processAnalysisQuery("kwal", req.user.id, project_id, transcripts, { search_utterance });

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
        const newId = processAnalysisQuery("lexrare", req.user.id, req.body.project_id, transcripts, {
            target_tier,
        });

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
