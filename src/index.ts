import express from "express";
import { corsOptions } from "./config/cors.config";
import cors from "cors";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
