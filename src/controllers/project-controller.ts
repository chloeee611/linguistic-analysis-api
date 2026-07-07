import { Request, Response } from "express";
import { User } from "../model/user.types";
import { Project } from "../model/project.types";
import sql from "../external/db";

export const getAllProjects = async (req: Request, res: Response) => {
    const users = await sql<User[]>`
        SELECT *
        FROM projects
        WHERE user_id = ${req.user.id}
    `;

    res.status(200);
    res.json(users);
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

    await sql`
    INSERT INTO projects (user_id, title, description)
    VALUES (${req.user.id}, ${title}, ${description})`;

    res.status(201);
    res.json({});
};
