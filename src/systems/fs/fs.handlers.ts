import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";

import type { UploadFileQuerystring, GetFileQuerystring } from "./fs.schemas";

const pump = util.promisify(pipeline);

export async function uploadFileHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Querystring: UploadFileQuerystring }>,
    reply: FastifyReply,
) {
    const parentFolderId = request.query.parentFolderId;

    const fileData = await request.file();

    if (!fileData) {
        return reply.code(400).send({ status: "fail", error: "No file provided" });
    }

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
    await pump(fileData.file, fs.createWriteStream("./FileStore/" + request.user.id + "/" + fileDetails.id));

    return reply.code(201).send({ status: "success", id: fileDetails.id });
}

export async function getFileHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Querystring: GetFileQuerystring }>,
    reply: FastifyReply,
) {
    const fileData = await this.prisma.file.findUnique({
        where: { id: request.query.fileId },
    });

    if (!fileData) {
        return reply.code(404).send({ message: "File not found" });
    }

    if (fileData.fileAccess != "PUBLIC") {
        if (request.authenticated == false) {
            return reply.code(401).send({ error: "Unauthorized", message: "You do not have access to this file" });
        }

        if (request.user.id != fileData.ownerId) {
            return reply.code(403).send({ error: "Forbidden", message: "You do not have access to this file" });
        }
    }

    return reply.sendFile(fileData.ownerId + "/" + fileData.id);
}
