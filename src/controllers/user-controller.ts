import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../external/db";

export const getAllUsers = async (_: Request, res: Response) => {
    const users = await sql<User[]>`
        SELECT *
        FROM users
    `;

    res.status(200);
    res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    const users = await sql<User[]>`
        SELECT *
        FROM users
        WHERE users.id = ${id}
    `;

    res.status(200);
    res.json(users[0]);
};

export const getMe = async (req: Request, res: Response) => {
    const { id } = req.user;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    const users = await sql<User[]>`
        SELECT *, TO_CHAR(dob, 'yyyy-mm-dd') as dob
        FROM users
        WHERE users.id = ${id}
    `;

    res.status(200);
    res.json(users[0]);
};

export const putUserDetails = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { email, dob, bio, research_field, location } = req.body;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    const users = await sql<User[]>`
        UPDATE users
        SET email = ${email}, dob = ${dob}, bio = ${bio}, research_field = ${research_field}, location = ${location}
        WHERE id = ${id}
    `;

    res.status(200);
    res.json(users);
};
