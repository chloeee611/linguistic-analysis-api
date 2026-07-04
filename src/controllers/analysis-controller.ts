import { Request, Response } from "express";
import { api } from "../external/analysis-api";

export const postFrequency = async (req: Request, res: Response) => {
    // Get the transcript file name
    const { transcriptName } = req.params;

    // Forward the request to Python API
    const { data } = await api.post(`analysis/frequency/${transcriptName}`);
    res.json(data);
};
