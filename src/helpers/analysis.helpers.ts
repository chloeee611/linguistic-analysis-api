import { Transcript } from "../model/transcript.types";
import { api } from "../external/analysis-api";

import sql from "../external/db";

export const processLexRare = async (
    userId: number,
    projectId: string,
    targetTier: "mor" | "utt",
    transcripts: Pick<Transcript, "id" | "file_url">[],
) => {
    const requestBody: any = {
        urls: transcripts.map(({ file_url }: { file_url: string }) => file_url),
        target_tier: targetTier,
    };

    const { data } = await api.post(`analysis/lexrare`, requestBody);

    const rows = await sql<{ id: number }[]>`
        INSERT INTO analyses (user_id, project_id, type, request, result)
        VALUES (${userId}, ${projectId ?? null}, 'lexrare', ${requestBody}, ${data})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        throw new Error("There was an issue inserting analysis");
    }

    for (const { id } of transcripts) {
        await sql`
            INSERT INTO analyses_transcripts (analysis_id, transcript_id)
            VALUES (${newId}, ${id})
        `;
    }

    return newId;
};
