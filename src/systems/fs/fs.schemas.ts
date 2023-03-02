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
    fileExtension: z.string({
        required_error: "File extension is required",
        invalid_type_error: "File extension must be a string",
    }),
};

const uploadFileSchema = z.object({
    ...fileInfoBase,
    folderPath: z.string({
        required_error: "Folder path is required",
        invalid_type_error: "Folder path must be a string",
    }),
});

const uploadFileResponseSchema = z.object({
    id: z.string(),
    ...fileInfoBase,
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

export const { schemas: fsSchemas, $ref } = buildJsonSchemas(
    { uploadFileSchema, uploadFileResponseSchema },
    { $id: "FS" },
);
