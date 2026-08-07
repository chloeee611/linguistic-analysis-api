import { AnalysisType } from "../model/analysis.types";
import { Transcript } from "../model/transcript.types";
import { api } from "../external/analysis-api";

import sql from "../external/db";

export const processAnalysisQuery = async (
    type: AnalysisType,
    userId: number,
    projectId: string,
    transcripts: Pick<Transcript, "id" | "file_url">[],
    args: Record<string, unknown> = {},
) => {
    const requestBody: any = {
        urls: transcripts.map(({ file_url }: { file_url: string }) => file_url),
        ...args,
    };

    const { data } = await api.post(`analysis/${type}`, requestBody);

    const rows = await sql<{ id: number }[]>`
        INSERT INTO analyses (user_id, project_id, type, request, result)
        VALUES (${userId}, ${projectId ?? null}, ${type}, ${requestBody}, ${data})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        throw new Error(`There was an issue inserting ${type} analysis`);
    }

    for (const { id } of transcripts) {
        await sql`
            INSERT INTO analyses_transcripts (analysis_id, transcript_id)
            VALUES (${newId}, ${id})
        `;
    }

    return newId;
};
