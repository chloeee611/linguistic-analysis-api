import { Request, Response } from "express";
import { LexRareReturn } from "../model/analysis.types";
import { Project } from "../model/project.types";

import moment from "moment";
import sql from "../external/db";

export const getAllProjects = async (req: Request, res: Response) => {
    const projects = await sql<Project[]>`
        SELECT *
        FROM projects
        WHERE user_id = ${req.user.id}
    `;

    res.status(200);
    res.json(projects);
};

export const getProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    const projects = await sql<Project[]>`
        SELECT *
        FROM projects
        WHERE id = ${projectId}
        AND user_id = ${req.user.id}
    `;

    if (projects.length === 0) {
        res.status(404).json({
            message: "Project not found",
        });

        return;
    }

    res.status(200);
    res.json(projects[0]);
};

type ProjectDashboardLex = {
    result: LexRareReturn;
    date: string;
};

export const getProjectDashboard = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    // Gathers data from transcripts, analyses, and analyses_transcripts for the graph
    const lexRareResults = await sql<ProjectDashboardLex[]>`
        SELECT transcripts.id, MAX(analyses.created_at), jsonb_path_query(transcripts.metadata, '$.date') as date, analyses_transcripts.result
        FROM analyses_transcripts
        INNER JOIN transcripts
        ON analyses_transcripts.transcript_id = transcripts.id
        INNER JOIN analyses
        ON analyses_transcripts.analysis_id = analyses.id
        WHERE transcripts.project_id = ${projectId}
        AND transcripts.user_id = ${req.user.id}
        AND analyses.type = 'lexrare'
        GROUP BY transcripts.id, analyses_transcripts.result
        ORDER BY date ASC
    `;

    if (lexRareResults.length === 0) {
        res.status(200).json({
            message: "Lex not found",
        });

        return;
    }

    // Aggregates all speakers and their rare words data
    const keys: Record<string, string> = {};

    const lexGraph = lexRareResults.map(({ date: dateString, result }) => {
        const date = moment(dateString).format("DD-MM-YY");
        const resultValues = Object.values(result);

        const yAxis: Record<string, number> = {};

        for (const { code, percent_rare_words } of resultValues) {
            keys[code] = "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
            yAxis[code] = percent_rare_words * 100;
        }

        return { date, ...yAxis };
    });

    res.status(200);
    res.json({ data: lexGraph, keys });
};

export const postProject = async (req: Request, res: Response) => {
    const { title, description, children } = req.body;

    const rows = await sql<{ id: number }[]>`
    INSERT INTO projects (user_id, title, description)
    VALUES (${req.user.id}, ${title}, ${description}) RETURNING id`;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        res.status(500);
        res.json({ error: "There was an issue inserting project" });
        return;
    }

    for (const child of children) {
        await sql<{ id: number }[]>`
            INSERT INTO children (project_id, name)
            VALUES (${newId}, ${child}) RETURNING id`;
    }

    res.status(201);
    res.json({ id: Number(newId) });
};
