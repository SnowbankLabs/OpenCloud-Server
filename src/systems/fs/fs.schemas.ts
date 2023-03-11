import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const uploadFileQuerySchema = z.object({
    parentFolderId: z.string({
        required_error: "Parent folder ID is required",
        invalid_type_error: "Parent folder ID must be a string",
    }),
});

const uploadFileResponseSchema = z.object({
    id: z.string(),
    status: z.string(),
});

const getFileParamsSchema = z.object({
    fileId: z.string({
        required_error: "File ID is required",
        invalid_type_error: "File ID must be a string",
    }),
});

export type UploadFileQuerystring = z.infer<typeof uploadFileQuerySchema>;
export type GetFileParams = z.infer<typeof getFileParamsSchema>;

export const { schemas: fsSchemas, $ref } = buildJsonSchemas(
    { uploadFileQuerySchema, uploadFileResponseSchema, getFileParamsSchema },
    { $id: "FS" },
);
