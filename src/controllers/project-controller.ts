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

export const getProjectSummary = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    const projects = await sql<Project[]>`
        SELECT transcripts.metadata, analyses.type, analyses.result
        FROM transcripts
        INNER JOIN analyses
        ON transcripts.project_id = analyses.project_id
        WHERE transcripts.project_id = ${projectId}
        AND transcripts.user_id = ${req.user.id}
    `;

    if (projects.length === 0) {
        res.status(404).json({
            message: "Project not found",
        });

        return;
    }

    res.status(200);
    res.json(projects);
};

export const postProject = async (req: Request, res: Response) => {
    const { title, description } = req.body;

    const rows = await sql<{ id: number }[]>`
    INSERT INTO projects (user_id, title, description)
    VALUES (${req.user.id}, ${title}, ${description}) RETURNING id`;

    const newId = rows[0]?.id;

    if (newId === undefined) {
        res.status(500);
        res.json({ error: "There was an issue inserting project" });
        return;
    }

    res.status(201);
    res.json({ id: Number(newId) });
};
