import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../db/db";

export const getAllUsers = async (_: Request, res: Response) => {
    const users = await sql<User[]>`
        SELECT *
        FROM users
    `;

    res.header("Access-Control-Allow-Origin", "*");
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

export const postUser = (_: Request, __: Response) => {};
