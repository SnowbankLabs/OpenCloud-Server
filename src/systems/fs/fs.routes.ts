import type { FastifyInstance } from "fastify";

import { $ref } from "./fs.schemas";
import { uploadFileHandler } from "./fs.handlers";

async function fileSystemRouter(server: FastifyInstance) {
    server.route({
        method: "POST",
        url: "/upload",
        schema: {
            body: $ref("uploadFileSchema"),
            response: { 201: $ref("uploadFileResponseSchema") },
        },
        handler: uploadFileHandler,
    });
}

export default fileSystemRouter;
