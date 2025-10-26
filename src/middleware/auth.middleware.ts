import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { Users } from "../models/User";
import status from "http-status";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res
      .status(status.UNAUTHORIZED)
      .json({ status: status[401], message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    const user = await AppDataSource.getRepository(Users).findOneBy({
      id: decoded.id,
    });
    if (!user) {
      res
        .status(status.UNAUTHORIZED)
        .json({ status: status[401], message: "Unauthorized" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ status: status[401], message: "Invalid token" });
  }
};
