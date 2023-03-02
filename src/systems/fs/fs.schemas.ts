import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const fileInfoBase = {
    fileName: z.string({
        required_error: "File name is required",
        invalid_type_error: "File name must be a string",
    }),
    fileSize: z.number({
        required_error: "File size is required",
        invalid_type_error: "File size must be a number",
    }),
};

const uploadFileSchema = z.object({
    ...fileInfoBase,
    password: z
        .string({
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        })
        .min(5, { message: "Must be 5 or more characters long" }),
});

const uploadFileResponseSchema = z.object({
    id: z.string(),
    ...fileInfoBase,
    rootFolderId: z.string(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

export const { schemas: fsSchemas, $ref } = buildJsonSchemas(
    { uploadFileSchema, uploadFileResponseSchema },
    { $id: "FS" },
);
