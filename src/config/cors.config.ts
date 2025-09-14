import cors, { CorsOptions } from "cors";

let whitelist: string[] = [
  "https://localhost:3000",
  "https://ping.vercel.app",
  "https://chat.ping.vercel.app",
];

export let corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  maxAge: 86400,
};
