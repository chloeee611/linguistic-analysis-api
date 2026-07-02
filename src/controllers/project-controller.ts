import { Request, Response } from "express";
import { User } from "../model/user.types";
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

export const postProject = async (req: Request, res: Response) => {
    const { title, description } = req.body;

    await sql`
    INSERT INTO projects (user_id, title, description)
    VALUES (${req.user.id}, ${title}, ${description})`;

    res.status(201);
    res.json({});
};
