import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../external/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type LoginRequest = {
    username: string;
    password: string;
};

export const postLogin = async (req: Request, res: Response) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Secret string not found");
    }

    const { username, password } = req.body as LoginRequest;

    const users = await sql<User[]>`
        SELECT *
        FROM users
        WHERE username = ${username}
    `;

    if (users.length === 0) {
        res.status(400);
        res.json({
            status: "failure",
        });
        return;
    }

    const user = users[0]!;

    try {
        const match = await bcrypt.compare(password, user.password);

        // Password incorrect
        if (!match) {
            res.status(400);
            res.json({
                status: "failure",
            });
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500);
        res.json({
            message: err,
        });
        return;
    }

    // Password correct
    let token;

    try {
        token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );
    } catch (err2) {
        console.log(err2);
        res.status(500);
        res.json({
            message: err2,
        });
        return;
    }

    res.status(200);
    res.json({
        id: user.id,
        token,
    });
};
