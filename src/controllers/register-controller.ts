import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../db/db";
import bcrypt from "bcrypt";
const SALT_WORK_FACTOR = 10;

type RegisterRequest = {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export const postRegister = async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body as RegisterRequest;

    const usersWithUsername = await sql<User[]>`
        SELECT *
        FROM users
        WHERE username = ${username}
    `;

    if (usersWithUsername.length > 0) {
        res.status(400);
        res.json({
            status: "Username already exists",
        });
        return;
    }

    const usersWithEmail = await sql<User[]>`
        SELECT *
        FROM users
        WHERE username = ${username}
    `;

    if (usersWithEmail.length > 0) {
        res.status(400);
        res.json({
            status: "Email already in use",
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_WORK_FACTOR);

    await sql`
        INSERT INTO users (name, username, email, password)
        VALUES (${name}, ${username}, ${email}, ${hashedPassword})`;

    res.status(201);
    res.json({
        message: "User successfully registered",
    });
};
