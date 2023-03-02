import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import type { UploadFileInput } from "./fs.schemas";

export async function uploadFileHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: UploadFileInput }>,
    reply: FastifyReply,
) {
    

    return reply.code(200).send();
}