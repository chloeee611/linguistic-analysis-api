import { processFreq, processKwal, processLexRare, processMlu } from "../helpers/analysis.helpers";
import { Request, Response } from "express";

export const postFreq = async (req: Request, res: Response) => {
    const { project_id, search, transcripts } = req.body;

    try {
        const newId = processFreq(req.user.id, project_id, search, transcripts);

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
        const newId = processMlu(req.user.id, req.body.project_id, transcripts);

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
        const newId = processKwal(req.user.id, project_id, search_utterance, transcripts);

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
        const newId = processLexRare(req.user.id, req.body.project_id, target_tier, transcripts);

        res.status(200);
        res.json({ id: newId });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
