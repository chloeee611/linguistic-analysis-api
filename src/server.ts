import express, { Request, Response } from "express";
import { json } from "body-parser";
import userRouter from "./routes/user-routes";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Routes

app.use("/api/users", userRouter);

// Error handling middleware
app.use((err: Error, _: Request, res: Response) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
