import { z } from "zod";

export const serverSchema = z.object({
    AUTH_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
});
