import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const userBase = {
    username: z
        .string({
            required_error: "Username is required",
            invalid_type_error: "Username must be a string",
        })
        .min(3, { message: "Must be 1 or more characters long" }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
};

const createUserSchema = z.object({
    ...userBase,
    password: z
        .string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        })
        .min(5, { message: "Must be 5 or more characters long" }),
});

const createUserResponseSchema = z.object({
    id: z.string(),
    ...userBase,
});

const loginSchema = z.object({
    username: z.string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
    }),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }),
});

const loginResponseSchema = z.object({
    accessToken: z.string(),
    // refreshToken: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
    {
        createUserSchema,
        createUserResponseSchema,
        loginSchema,
        loginResponseSchema,
    },
    { $id: "Auth" },
);
