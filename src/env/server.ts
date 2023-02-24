import { serverSchema } from "./schema";

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 4));
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;
