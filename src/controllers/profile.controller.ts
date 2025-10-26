/// <reference path="../types/express.d.ts" />
import { Request, Response } from "express";
import status from "http-status";
import { AppDataSource } from "../data-source";
import { Profile } from "../models/Profile";
import { Users } from "../models/User";

export class ProfileController {
  private profileRepository = AppDataSource.getRepository(Profile);
  private userRepository = AppDataSource.getRepository(Users);

  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(status.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const { phone_number, date_of_birth } = req.body;

      // Load the user entity to create the relationship
      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(status.NOT_FOUND).json({ message: "User not found" });
        return;
      }

      const profile = this.profileRepository.create({
        user,
        avatar: "",
        bio: "",
        phone_number,
        date_of_birth,
      });

      await this.profileRepository.save(profile);
      res.status(status.CREATED).json(profile);
    } catch (error) {
      console.error(error);
      res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "Failed to create profile",
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;

      if (!user_id) {
        res.status(status.BAD_REQUEST).json({ message: "User ID is required" });
        return;
      }

      const profile = await this.profileRepository.findOne({
        where: { user: { id: user_id } },
        relations: ["user"],
      });

      if (!profile) {
        res.status(status.NOT_FOUND).json({ message: "Profile not found" });
        return;
      }

      // Return profile with user information
      const profileWithUser = {
        ...profile,
        user: {
          full_name: profile.user.full_name,
          email: profile.user.email,
          verified: profile.user.verified,
        },
      };

      res.status(status.OK).json(profileWithUser);
    } catch (error) {
      res.status(status.INTERNAL_SERVER_ERROR).json({
        message: "Failed to get profile",
      });
    }
  }
}
