import { AnalysisArgs, AnalysisType } from "../model/analysis.types";
import { Transcript } from "../model/transcript.types";
import { api } from "../external/analysis-api";

import sql from "../external/db";

export const processAnalysisQuery = async <T extends AnalysisType>(
    type: T,
    userId: number,
    projectId: string,
    transcripts: Pick<Transcript, "id" | "file_url">[],
    args?: AnalysisArgs[T],
) => {
    const requestBody: any = {
        urls: transcripts.map(({ file_url, id }) => ({ file_url, id })),
        ...args,
    };

    const { data } = await api.post(`analysis/${type}`, requestBody);

    const rows = await sql<{ id: number }[]>`
        INSERT INTO analyses (user_id, project_id, type, request)
        VALUES (${userId}, ${projectId ?? null}, ${type}, ${requestBody})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        throw new Error(`There was an issue inserting ${type} analysis`);
    }

    // TODO: add result to this, not above

    for (const { id } of transcripts) {
        await sql`
            INSERT INTO analyses_transcripts (analysis_id, transcript_id, result)
            VALUES (${newId}, ${id}, ${data[id]})
        `;
    }

    return newId;
};
