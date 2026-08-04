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

export const linkTranscriptsToProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { transcripts } = req.body as { transcripts: string[] };

    if (projectId === undefined || Array.isArray(projectId)) {
        res.status(400);
        return;
    }

    for (const transcriptId of transcripts) {
        await sql`
            INSERT INTO projects_transcripts (project_id, transcript_id)
            VALUES (${projectId}, ${transcriptId})
        `;
    }

    res.status(201);
    res.json({ message: `${transcripts.length} transcripts linked` });
};
