import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { FastifyJWT } from "@fastify/jwt";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";

import { env } from "@env/server";
import type { UploadFileQuerystring, GetFileQuerystring } from "./fs.schemas";

const pump = util.promisify(pipeline);

export async function uploadHandler(
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
            fileAccess: "PRIVATE",
            parentFolder: {
                connect: { id: parentFolderId },
            },
        },
    });

    let folderPath = "";

    if (env.NODE_ENV == "docker") {
        folderPath = "/FileStore/" + request.user.id;
    } else {
        folderPath = "./FileStore/" + request.user.id;
    }

    const filePath = folderPath + "/" + fileDetails.id;

    // Verify correct folder structure exists, otherwise create it
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Save file to appropriate FileStore
    await pump(fileData.file, fs.createWriteStream(filePath));

    // Save file size to db
    const sizeInBytes = fs.statSync(filePath).size;

    await this.prisma.file.update({
        where: { id: fileDetails.id },
        data: { fileSize: sizeInBytes },
    })

    return reply.code(201).send({ status: "success", id: fileDetails.id });
}

export async function tokenUploadHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const fileData = await request.file();

    if (!fileData) {
        return reply.code(400).send({ status: "fail", error: "No file provided" });
    }

    if (!fileData.fields["uploadToken"] || !("value" in fileData.fields["uploadToken"])) {
        return reply.code(401).send({ status: "fail", error: "No upload token provided" });
    }

    const uploadTokenPayload: FastifyJWT["payload"] = this.jwt.verify(fileData.fields["uploadToken"].value as string);

    const uploadToken = await this.prisma.uploadToken.findUnique({
        where: { id: uploadTokenPayload.id },
    });

    if (!uploadToken) {
        return reply.code(401).send({ status: "fail", error: "Invalid upload token" });
    }

    for (const ruleId of uploadToken.accessControlRuleIds) {
        const result = await this.verifyAccessControlRule(request, ruleId);
        if (!result) {
            return reply.code(401).send({ status: "fail", error: "Unauthorized" });
        }
    }

    // Create file in db
    const fileDetails = await this.prisma.file.create({
        data: {
            fileName: fileData.filename,
            fileType: fileData.mimetype,
            ownerId: uploadToken.userId,
            fileAccess: uploadToken.fileAccess,
            parentFolder: {
                connect: { id: uploadToken.folderId },
            },
        },
    });

    let folderPath = "";

    if (env.NODE_ENV == "docker") {
        folderPath = "/FileStore/" + uploadToken.userId;
    } else {
        folderPath = "./FileStore/" + uploadToken.userId;
    }

    const filePath = folderPath + "/" + fileDetails.id;

    // Verify correct folder structure exists, otherwise create it
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Save file to appropriate FileStore
    await pump(fileData.file, fs.createWriteStream(filePath));

    // Save file size to db
    const sizeInBytes = fs.statSync(filePath).size;

    await this.prisma.file.update({
        where: { id: fileDetails.id },
        data: { fileSize: sizeInBytes },
    })

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

    void reply.header("Content-Type", fileData.fileType);
    void reply.header("Content-Disposition", `inline; filename="${fileData.fileName}"`);

    return reply.sendFile(fileData.ownerId + "/" + fileData.id);
}
