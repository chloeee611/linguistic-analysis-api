import { validateParamString } from "../helpers/validation.helpers";
import { Request, Response } from "express";
import { Project } from "../model/project.types";

import sql from "../external/db";

export const getAllTasks = async (req: Request, res: Response) => {
    const tasks = await sql<Project[]>`
        SELECT *
        FROM tasks
        WHERE user_id = ${req.user.id}
    `;

    res.status(200);
    res.json(tasks);
};

export const getTask = async (req: Request, res: Response) => {
    const { taskId } = req.params;

    if (!validateParamString(taskId)) {
        res.status(400);
        return;
    }

    const tasks = await sql<Project[]>`
        SELECT *
        FROM tasks
        WHERE id = ${taskId}
        AND user_id = ${req.user.id}
    `;

    if (tasks.length === 0) {
        res.status(404).json({
            message: "Project not found",
        });

        return;
    }

    res.status(200);
    res.json(tasks[0]);
};

export const cancelTask = async (req: Request, res: Response) => {
    const { taskId } = req.params;

    if (!validateParamString(taskId)) {
        res.status(400);
        return;
    }

    const tasks = await sql<Project[]>`
        UPDATE tasks
        SET status = 'cancelled'
        WHERE id = ${taskId}
        AND user_id = ${req.user.id}
    `;

    if (tasks.length === 0) {
        res.status(500).json({
            message: "Error cancelling task",
        });

        return;
    }

    res.status(200);
    res.json(tasks[0]);
};
