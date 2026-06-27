import { User } from "../model/user.types";

declare module "express-serve-static-core" {
    interface Request {
        user: { id: number };
    }
}
