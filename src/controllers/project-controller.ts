import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { generateSummary } from "../helpers/analysis.helpers";
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

export const getProjectDashboard = async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!validateParamString(projectId)) {
        res.status(400);
        res.json("Invalid project ID");
        return;
    }

    const currentColourKeys: Record<string, string> = {};

    const lexrare = await generateSummary(
        "lexrare",
        "Percentage Use of Rare Words",
        "$.CHI.percent_rare_words",
        projectId,
        req.user.id,
        currentColourKeys
    );
    const mlu = await generateSummary(
        "mlu",
        "Mean Length of Utterance",
        "$.counts.CHI.mlu",
        projectId,
        req.user.id,
        currentColourKeys
    );
    const freq = await generateSummary(
        "freq",
        "Spoken Words Over Time",
        "$.CHI.summary.total_items",
        projectId,
        req.user.id,
        currentColourKeys
    );

    res.status(200);
    res.json({ graphData: { lexrare, mlu, freq }, colourKeys: currentColourKeys });
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
