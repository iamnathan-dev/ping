/// <reference path="./types/express.d.ts" />
import express from "express";
import { corsOptions } from "./config/cors.config";
import cors from "cors";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

AppDataSource.initialize()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
