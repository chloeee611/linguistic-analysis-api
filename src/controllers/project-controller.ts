import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { Project } from "../model/project.types";

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
        SELECT projects.id, projects.title, projects.description
        FROM projects
        WHERE projects.id = ${projectId}
        AND projects.user_id = ${req.user.id}
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

export const getProjectChildren = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    const children = await sql<Project[]>`
        SELECT *
        FROM children
        WHERE project_id = ${projectId}
    `;

    if (children.length === 0) {
        res.status(200).json([]);
        return;
    }

    res.status(200);
    res.json(children);
};

type ProjectDashboardLex = {
    name: string;
    result: number;
    age: string;
};

export const getProjectDashboard = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!validateParamString(projectId)) {
        res.status(400);
        res.json("Invalid project ID");
        return;
    }

    // Gathers data from transcripts, analyses, and analyses_transcripts for the graph
    const lexRareResults = await sql<ProjectDashboardLex[]>`
        SELECT transcripts.id, MAX(analyses.created_at), jsonb_path_query(transcripts.metadata, '$.id.CHI.age') as age, jsonb_path_query(analyses_transcripts.result, '$.CHI.percent_rare_words') as result, children.name
        FROM analyses_transcripts
        INNER JOIN transcripts
        ON analyses_transcripts.transcript_id = transcripts.id
        INNER JOIN analyses
        ON analyses_transcripts.analysis_id = analyses.id
        INNER JOIN children
        ON transcripts.child_id = children.id
        WHERE transcripts.project_id = ${projectId}
        AND transcripts.user_id = ${req.user.id}
        AND analyses.type = 'lexrare'
        GROUP BY transcripts.id, analyses_transcripts.result, children.name
        ORDER BY age ASC
    `;

    if (lexRareResults.length === 0) {
        res.status(200).json({
            message: "Lex not found",
        });

        return;
    }

    // Aggregates all speakers and their rare words data
    const keys: Record<string, string> = {};

    const store: Record<string, Record<string, number>> = {};

    for (const { name, age, result } of lexRareResults) {
        if (!(age in store)) {
            store[age] = { [name]: result };
        } else {
            store[age] = { ...store[age], [name]: result };
        }

        if (!(name in keys)) {
            keys[name] = "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
        }
    }

    const graphData = Object.entries(store).flatMap(([age, data]) => {
        return { age, ...data };
    });

    res.status(200);
    res.json({ data: graphData, keys });
};

export const putProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { title, description, children } = req.body;

    if (!validateParamString(projectId)) {
        res.status(400);
        res.json("Invalid project ID");
        return;
    }

    await sql<{ id: number }[]>`
        UPDATE projects SET title = ${title}, description = ${description}
        WHERE id = ${projectId}`;

    for (const child of children) {
        await sql<{ id: number }[]>`
            INSERT INTO children (project_id, name)
            VALUES (${projectId}, ${child}) RETURNING id`;
    }

    res.status(200);
    res.json({ message: "Project updated" });
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
