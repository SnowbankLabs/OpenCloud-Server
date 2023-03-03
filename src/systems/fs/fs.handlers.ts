import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";

// import type { UploadFileInput } from "./fs.schemas";

const pump = util.promisify(pipeline);

export async function uploadFileHandler(
    this: FastifyInstance,
    // request: FastifyRequest<{ Body: UploadFileInput }>,
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const data = await request.file();

    if (!data) {
        return reply.code(400).send();
    }

    await pump(data.file, fs.createWriteStream("./FileStore/" + data.filename));

    return reply.code(200).send();
}
