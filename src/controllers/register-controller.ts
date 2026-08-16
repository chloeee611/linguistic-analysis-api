import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../external/db";
import bcrypt from "bcrypt";
import { validateEmail, validatePassword, validateUsername } from "../helpers/validation.helpers";
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

    const validationResults: Record<string, string> = {};

    if (!validateUsername(username)) {
        validationResults.username =
            "Username must be between 3 and 15 characters and contain only letters, numbers, and underscores";
    }

    if (!validateEmail(email)) {
        validationResults.email = "Invalid email address";
    }

    if (!validatePassword(password)) {
        validationResults.password =
            "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number";
    }

    if (Object.keys(validationResults).length > 0) {
        res.status(400).json({
            message: "Validation error",
            validationResults,
        });
        return;
    }

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
        // TODO make user auto login after successfully registering
        message: "User successfully registered",
    });
};
