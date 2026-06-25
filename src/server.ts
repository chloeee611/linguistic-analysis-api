import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { json } from "body-parser";

import registerRouter from "./routes/register-routes";
import analysisRouter from "./routes/analysis-routes";
import loginRouter from "./routes/login-routes";
import userRouter from "./routes/user-routes";
import express from "express";
import cors from "cors";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use("/api/users", userRouter);
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/analysis", analysisRouter);

// Error handling middleware
// app.use((err: Error, _: Request, res: Response) => {
//     console.error(err);
//     res.status(500).json({ message: "Something went wrong!" });
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
