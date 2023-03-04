import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";

import type { UploadFileQuerystring } from "./fs.schemas";

const pump = util.promisify(pipeline);

export async function uploadFileHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Querystring: UploadFileQuerystring }>,
    reply: FastifyReply,
) {
    const parentFolderId = request.query.parentFolderId;

    const fileDataMulti = request.files();

    if (!fileDataMulti) {
        return reply.code(400).send({ status: "fail", error: "No files provided" });
    }

    for await (const fileData of fileDataMulti) {
        // Create file in db
        const fileDetails = await this.prisma.file.create({
            data: {
                fileName: fileData.filename,
                fileType: fileData.mimetype,
                ownerId: request.user.id,
                parentFolder: {
                    connect: { id: parentFolderId },
                },
            },
        });

        // Verify correct folder structure exists, otherwise create it
        if (!fs.existsSync("./FileStore/" + request.user.id)) {
            fs.mkdirSync("./FileStore/" + request.user.id, { recursive: true });
        }

        // Save file to appropriate FileStore
        await pump(
            fileData.file,
            fs.createWriteStream("./FileStore/" + request.user.id + "/" + fileDetails.localFileId),
        );
    }

    return reply.code(200).send({ status: "success" });
}
