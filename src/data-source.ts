import { DataSource } from "typeorm";
import { Users } from "./models/User";
import { Profile } from "./models/Profile";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "authdb",
  entities: [Users, Profile],
  synchronize: process.env.NODE_ENV === "production" ? false : true,
});
