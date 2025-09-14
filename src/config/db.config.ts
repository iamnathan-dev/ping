import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool: Pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.connect((err, client, release) => {
  if (err) {
    console.log("Error connecting to PostgreSQL:", err.stack);
    return;
  }

  console.log("Connected to PostgreSQL database");
  release();
});

export default pool;
