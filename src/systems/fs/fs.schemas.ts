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
});

export type UploadFileQuerystring = z.infer<typeof uploadFileQuerySchema>;

export const { schemas: fsSchemas, $ref } = buildJsonSchemas(
    { uploadFileQuerySchema, uploadFileResponseSchema },
    { $id: "FS" },
);
