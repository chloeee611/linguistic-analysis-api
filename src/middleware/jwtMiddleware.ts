import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export const validateJwt = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const auth = req.headers["authorization"];
    const token = auth?.split(" ")[1];

    if (!token) {
        console.log("Error - no token provided");
        res.status(500);
        res.json({
            message: "Error - no token provided",
        });
        return;
    }
    try {
        // @ts-ignore
        req.user = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch (error) {
        console.log(error);
        if (error instanceof jwt.TokenExpiredError) {
            res.status(403);
            res.json({
                message: "Token has expired",
            });
        } else {
            res.status(403);
            res.json({
                message: "Error - invalid token",
            });
        }

        return;
    }
};
