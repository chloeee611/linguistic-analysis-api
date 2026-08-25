import { validateRequiredString, validateEmail, validateDob } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { User } from "../model/user.types";
import sql from "../external/db";

// Gets all users
export const getAllUsers = async (_: Request, res: Response) => {
    const users = await sql<User[]>`
        SELECT id, name, username, email, bio, research_field, location, TO_CHAR(dob, 'yyyy-mm-dd') as dob
        FROM users
    `;

    res.status(200);
    res.json(users);
};

// Gets one user
export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    const users = await sql<User[]>`
        SELECT id, name, username, email, bio, research_field, location, TO_CHAR(dob, 'yyyy-mm-dd') as dob
        FROM users
        WHERE users.id = ${id}
    `;

    res.status(200);
    res.json(users[0]);
};

// Gets the current user securely
export const getMe = async (req: Request, res: Response) => {
    const { id } = req.user;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    const users = await sql<User[]>`
        SELECT id, name, username, email, bio, research_field, location, TO_CHAR(dob, 'yyyy-mm-dd') as dob
        FROM users
        WHERE users.id = ${id}
    `;

    res.status(200);
    res.json(users[0]);
};

// Allows user to edit profile details
export const putUserDetails = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { email, dob, bio, research_field, location } = req.body;

    if (id === undefined || Array.isArray(id)) {
        res.status(400);
        return;
    }

    // Validates the inputted data
    const validationResults: Record<string, string> = {};

    if (!validateEmail(email)) {
        validationResults.email = "Invalid email address";
    }

    if (!validateDob(dob)) {
        validationResults.dob = "Invalid date of birth";
    }

    if (!validateRequiredString(bio)) {
        validationResults.bio = "Bio is required";
    }

    if (!validateRequiredString(research_field)) {
        validationResults.research_field = "Research field is required";
    }

    if (!validateRequiredString(location)) {
        validationResults.location = "Location is required";
    }

    if (Object.keys(validationResults).length > 0) {
        res.status(400).json({
            message: "Validation error",
            validationResults,
        });
        return;
    }

    // SQL query updates the relevant row of data in the users table based on the inputted profile data
    const users = await sql<User[]>`
        UPDATE users
        SET email = ${email}, dob = ${dob}, bio = ${bio}, research_field = ${research_field}, location = ${location}
        WHERE id = ${id}
    `;

    res.status(200);
    res.json(users);
};

// Gets the data required for the homepage dashboard stats
export const getDashboard = async (req: Request, res: Response) => {
    // Total number of projects
    const projects = await sql<{ count: string }[]>`
        SELECT COUNT(*) AS count
        FROM projects
        WHERE user_id = ${req.user.id}
    `;

    // Total number of transcripts
    const transcripts = await sql<{ count: string }[]>`
        SELECT COUNT(*) AS count
        FROM transcripts
        WHERE user_id = ${req.user.id}
    `;

    // Total number of analyses
    const analyses = await sql<{ count: string }[]>`
        SELECT COUNT(*) AS count
        FROM analyses
        WHERE user_id = ${req.user.id}
    `;

    // Total number of analyses this week
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;

    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const analysesThisWeek = await sql<{ count: string }[]>`
        SELECT COUNT(*) AS count
        FROM analyses
        WHERE user_id = ${req.user.id}
        AND created_at >= ${startOfWeek}
    `;

    res.status(200).json({
        projectCount: Number(projects[0]?.count ?? 0),
        transcriptCount: Number(transcripts[0]?.count ?? 0),
        analysisCount: Number(analyses[0]?.count ?? 0),
        weeklyAnalysisCount: Number(analysesThisWeek[0]?.count ?? 0),
    });
};
