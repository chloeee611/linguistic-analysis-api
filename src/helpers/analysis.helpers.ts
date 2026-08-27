import { AnalysisArgs, AnalysisType } from "../model/analysis.types";
import { analysisApi } from "../external/analysis-api";
import { Transcript } from "../model/transcript.types";

import sql from "../external/db";

// Handles analysis
export const processAnalysisQuery = async <T extends AnalysisType>(
    type: T,
    userId: number,
    projectId: string,
    transcripts: Pick<Transcript, "id" | "file_url">[],
    args?: AnalysisArgs[T]
) => {
    const requestBody: any = {
        urls: transcripts.map(({ file_url, id }) => ({ file_url, id })),
        ...args,
    };

    // Performs the relevant analysis
    const { data } = await analysisApi.post(`analysis/${type}`, requestBody);

    // Inserts new row into the analyses table once analysis is complete
    const rows = await sql<{ id: number }[]>`
        INSERT INTO analyses (user_id, project_id, type, request)
        VALUES (${userId}, ${projectId ?? null}, ${type}, ${requestBody})
        RETURNING id
    `;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        throw new Error(`There was an issue inserting ${type} analysis`);
    }

    // Inserts new row into the analyses_transcripts table with the results
    for (const { id } of transcripts) {
        await sql`
            INSERT INTO analyses_transcripts (analysis_id, transcript_id, result)
            VALUES (${newId}, ${id}, ${data[id]})
        `;
    }

    return newId;
};

type ProjectDashboardGraph = {
    name: string;
    result: number;
    age: string;
};

// Pulls the data required for the MLU, FREQ, and LEXRARE graphs
export const generateSummary = async (
    type: AnalysisType,
    title: string,
    jsonSearch: string,
    projectId: string,
    userId: number,
    currentColourKeys: Record<string, string>
) => {
    const rows = await sql<ProjectDashboardGraph[]>`
        SELECT transcripts.id, MAX(analyses.created_at), jsonb_path_query(transcripts.metadata, '$.id.CHI.age') as age, jsonb_path_query(analyses_transcripts.result, ${jsonSearch}) as result, children.name
        FROM analyses_transcripts
        INNER JOIN transcripts
        ON analyses_transcripts.transcript_id = transcripts.id
        INNER JOIN analyses
        ON analyses_transcripts.analysis_id = analyses.id
        INNER JOIN children
        ON transcripts.child_id = children.id
        WHERE transcripts.project_id = ${projectId}
        AND transcripts.user_id = ${userId}
        AND analyses.type = ${type}
        AND transcripts.deleted_at IS NULL
        GROUP BY transcripts.id, analyses_transcripts.result, children.name
        ORDER BY age ASC
    `;

    if (rows.length === 0) {
        return;
    }

    const store: Record<string, Record<string, number>> = {};
    const keys = new Set<string>();

    for (const { name, age, result } of rows) {
        if (!(age in store)) {
            store[age] = { [name]: result };
        } else {
            store[age] = { ...store[age], [name]: result };
        }

        if (!(name in keys)) {
            keys.add(name);
        }

        if (!(name in currentColourKeys)) {
            const currentKeyCount = Object.keys(currentColourKeys).length + 1;
            currentColourKeys[name] = `hsl(${currentKeyCount * 137.508},70%,50%)`;
        }
    }

    const graphData = Object.entries(store).flatMap(([age, data]) => {
        return { age, ...data };
    });

    return {
        title,
        data: graphData,
        keys: Array.from(keys),
    };
};
