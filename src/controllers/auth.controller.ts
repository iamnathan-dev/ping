import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../models/User";
import { Profile } from "../models/Profile";
import status from "http-status";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { plainToClass } from "class-transformer";
import { EmailService } from "../services/email.service";
import EncryptionService from "../services/encryption.service";

dotenv.config();

export class AuthController {
  private userRepository = AppDataSource.getRepository(Users);
  private profileRepository = AppDataSource.getRepository(Profile);
  private emailService = new EmailService();
  private encryptionService = new EncryptionService();

  async register(req: Request, res: Response): Promise<void> {
    const { fullName, email, password, username } = req.body;

    try {
      if (!fullName || !username || !email || !password) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Missing required fields.",
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

      const isPasswordValid =
        this.encryptionService.checkPasswordStrength(password);

      if (!isPasswordValid) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message:
            "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.",
        });
        return;
      }

      const hashedPassword = await this.encryptionService.hashPassword(
        password
      );
      const user = this.userRepository.create({
        full_name: fullName,
        username,
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);

      // Create profile for the user
      const profile = this.profileRepository.create({
        user,
      });
      await this.profileRepository.save(profile);

      const verificationToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      await this.emailService.sendVerificationEmail(
        email,
        fullName,
        verificationToken
      );

      res.status(status.OK).json({
        status: status[200],
        message: `Please check your email to verify your account.`,
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

      if (!user.verified) {
        res.status(status.FORBIDDEN).json({
          status: status[403],
          message: "Please verify your account before login!",
        });
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

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      if (!email || typeof email !== "string") {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Email is required",
        });
        return;
      }

      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "User not found",
        });
        return;
      }

      const resetToken = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      await this.emailService.sendResetPasswordEmail(
        email,
        user.full_name,
        resetToken
      );

      res.status(status.OK).json({
        status: status[200],
        message: "Please check your email for reset password mail",
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;

    try {
      if (!token || typeof token !== "string") {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Verification token is required",
        });
        return;
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set");
        res.status(status.INTERNAL_SERVER_ERROR).json({
          status: status[500],
          message: "Server configuration error",
        });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };

      const user = await this.userRepository.findOneBy({
        email: decoded.email,
      });

      if (!user) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Invalid or expired verification token",
        });
        return;
      }

      user.verified = true;
      await this.userRepository.save(user);

      res.status(status.OK).json({
        status: status[200],
        message: "Email verified successfully",
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refresh_token } = req.body;

    try {
      if (!refresh_token || typeof refresh_token !== "string") {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Refresh token is required",
        });
        return;
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set");
        res.status(status.INTERNAL_SERVER_ERROR).json({
          status: status[500],
          message: "Server configuration error",
        });
        return;
      }

      const decoded = jwt.verify(
        refresh_token,
        process.env.JWT_SECRET as string
      ) as { id: string };

      const user = await this.userRepository.findOneBy({ id: decoded.id });

      if (!user) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Invalid or expired refresh token",
        });
        return;
      }

      const access_token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1w" }
      );

      const userResponse = plainToClass(Users, user);

      res.status(status.OK).json({
        status: status[200],
        data: userResponse,
        access_token,
        refresh_token: refreshToken,
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    try {
      if (!token || typeof token !== "string") {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Reset token is required",
        });
        return;
      }

      if (!password || typeof password !== "string") {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Password is required",
        });
        return;
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET environment variable is not set");
        res.status(status.INTERNAL_SERVER_ERROR).json({
          status: status[500],
          message: "Server configuration error",
        });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        email: string;
      };

      const user = await this.userRepository.findOneBy({
        email: decoded.email,
      });

      if (!user) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message: "Invalid or expired reset token",
        });
        return;
      }

      const isPasswordValid =
        this.encryptionService.checkPasswordStrength(password);

      if (!isPasswordValid) {
        res.status(status.BAD_REQUEST).json({
          status: status[400],
          message:
            "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.",
        });
        return;
      }

      const hashedPassword = await this.encryptionService.hashPassword(
        password
      );
      user.password = hashedPassword;
      await this.userRepository.save(user);

      res.status(status.OK).json({
        status: status[200],
        message: "password reset successfull",
      });
    } catch (error) {
      res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ status: status[500], message: "internal server error" });
    }
  }
}
