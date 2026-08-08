import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { validateJwt } from "./middleware/jwtMiddleware";
import { json } from "body-parser";

import registerRouter from "./routes/register-routes";
import analysisRouter from "./routes/analysis-routes";
import projectRouter from "./routes/project-routes";
import loginRouter from "./routes/login-routes";
import userRouter from "./routes/user-routes";
import taskRouter from "./routes/task-routes";
import express from "express";
import cors from "cors";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/users", validateJwt, userRouter);
app.use("/api/tasks", validateJwt, taskRouter);
app.use("/api/projects", validateJwt, projectRouter);
app.use("/api/analysis", validateJwt, analysisRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
