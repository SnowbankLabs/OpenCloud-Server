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

const userInfoResponseSchema = z.object({
    id: z.string(),
    ...userBase,
    role: z.enum(["ADMIN", "USER"]),
    rootFolderId: z.string(),
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

const refreshSchema = z.object({
    refreshToken: z.string({
        required_error: "Refresh token is required",
        invalid_type_error: "Refresh token must be a string",
    }),
});

const credentialsResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

const createUploadTokenSchema = z.object({
    description: z.string().optional(),
    folderId: z.string({
        required_error: "Parent folder ID is required",
        invalid_type_error: "Parent folder ID must be a string",
    }),
    fileAccess: z.enum(["PRIVATE", "PROTECTED", "PUBLIC"]),
});

const createUploadTokenResponseSchema = z.object({
    uploadToken: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type CreateUploadTokenInput = z.infer<typeof createUploadTokenSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
    {
        createUserSchema,
        userInfoResponseSchema,
        loginSchema,
        refreshSchema,
        credentialsResponseSchema,
        createUploadTokenSchema,
        createUploadTokenResponseSchema,
    },
    { $id: "Auth" },
);
