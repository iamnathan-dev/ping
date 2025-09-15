import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../models/User";
import status from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { plainToClass } from "class-transformer";
import { EmailService } from "../services/email.service";

dotenv.config();

export class AuthController {
  private userRepository = AppDataSource.getRepository(Users);
  private emailService = new EmailService();

  async register(req: Request, res: Response): Promise<void> {
    const { full_name, email, password } = req.body;

    try {
      if (!full_name || !email || !password) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message:
            "Missing required fields: full_name, email, and password are required",
        });
        return;
      }

      const existingUser = await this.userRepository.findOneBy({ email });

      if (existingUser) {
        res
          .status(status.FORBIDDEN)
          .json({ status: status[403], message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({
        full_name,
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);

      const access_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      const refresh_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1w" }
      );

      const verificationToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      await this.emailService.sendVerificationEmail(
        email,
        full_name,
        verificationToken
      );

      const userResponse = plainToClass(Users, user);

      res.status(status.OK).json({
        status: status[200],
        message: "Please check your email for verification mail",
        data: userResponse,
        access_token,
        refresh_token,
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Missing required fields: email, and password are required",
        });
        return;
      }

      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        res
          .status(status.UNAUTHORIZED)
          .json({ status: status[401], message: "invalid credential" });
        return;
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        res
          .status(status.UNAUTHORIZED)
          .json({ status: status[401], message: "Invalid credentials" });
        return;
      }

      const access_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      const refresh_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1w" }
      );

      const userResponse = plainToClass(Users, user);

      res.status(status.OK).json({
        status: status[200],
        data: userResponse,
        access_token,
        refresh_token,
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      // todo: verify email logic
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }
}
