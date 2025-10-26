import { Users } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}

export {};
