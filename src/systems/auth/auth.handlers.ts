import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { FastifyJWT } from "@fastify/jwt";
import * as argon2 from "argon2";

import type {
    CreateUserInput,
    LoginInput,
    RefreshInput,
    CreateAccessRuleInput,
    CreateUploadTokenInput,
} from "./auth.schemas";

export async function createUserHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
) {
    const { username, firstName, lastName, password } = request.body;

    try {
        // Verify that user does not already exist
        if (await this.prisma.user.findUnique({ where: { username: username } })) {
            return reply.code(400).send({ message: "User with username already exists" });
        }

        // Create user in db
        const hashedPassword = await argon2.hash(password);

        // Create user in db
        const user = await this.prisma.user.create({
            data: {
                username: username,
                firstName: firstName != undefined ? firstName : null,
                lastName: lastName != undefined ? lastName : null,
                password: hashedPassword,
            },
        });

        // Create Root folder with default name "Files"
        const rootFolder = await this.prisma.folder.create({
            data: {
                folderName: "Files",
                ownerId: user.id,
                type: "ROOT",
            },
        });

        // Add root folder id to user
        const userWithRoot = await this.prisma.user.update({
            where: { id: user.id },
            data: { rootFolderId: rootFolder.id },
        });

        // Return user
        return reply.code(201).send(userWithRoot);
    } catch (e) {
        console.log(e);
        return reply.code(500).send(e);
    }
}

export async function loginHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply,
) {
    const body = request.body;

    const user = await this.prisma.user.findUnique({
        where: { username: body.username },
    });

    if (!user) {
        return reply.code(401).send({ message: "Invalid username or password" });
    }

    const passwordValid = await argon2.verify(user.password, body.password);

    if (passwordValid) {
        // Create refresh token in db
        const refreshToken = await this.prisma.refreshToken.create({
            data: {
                user: {
                    connect: { id: user.id },
                },
            },
        });

        // Return access credentials
        return {
            accessToken: this.jwt.sign({ id: user.id, type: "AccessToken" }, { expiresIn: "15m" }),
            refreshToken: this.jwt.sign({ id: refreshToken.id, type: "RefreshToken" }, { expiresIn: "7d" }),
        };
    }

    return reply.code(401).send({ message: "Invalid username or password" });
}

export async function refreshHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: RefreshInput }>,
    reply: FastifyReply,
) {
    const tokenPayload: FastifyJWT["payload"] = this.jwt.verify(request.body.refreshToken);

    // Get current token from db and verify that it is valid
    const currentRefreshToken = await this.prisma.refreshToken.findUnique({
        where: { id: tokenPayload.id },
    });

    // No token found in db with id from token payload
    if (!currentRefreshToken) {
        return reply.code(401).send({ message: "Invalid refresh token" });
    }

    if (!currentRefreshToken.valid) {
        // User refresh token potentially stolen, invalidate all of user's refresh tokens
        await this.prisma.refreshToken.updateMany({
            where: {
                userId: currentRefreshToken.userId,
            },
            data: {
                valid: false,
            },
        });

        return reply.code(401).send({ message: "Invalid refresh token" });
    }

    // Invalidate current refresh token
    await this.prisma.refreshToken.update({
        where: { id: tokenPayload.id },
        data: { valid: false },
    });

    const userId = currentRefreshToken.userId;

    // Create new refresh token in db
    const newRefreshToken = await this.prisma.refreshToken.create({
        data: {
            user: {
                connect: { id: userId },
            },
        },
    });

    return reply.code(200).send({
        accessToken: this.jwt.sign({ id: userId, type: "AccessToken" }, { expiresIn: "15m" }),
        refreshToken: this.jwt.sign({ id: newRefreshToken.id, type: "RefreshToken" }, { expiresIn: "7d" }),
    });
}

export async function infoHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const user = await this.prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
        return reply.code(500).send({ message: "Something went wrong. Please try again" });
    }

    return reply.code(200).send(user);
}

export async function createAccessRuleHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: CreateAccessRuleInput }>,
    reply: FastifyReply,
) {
    const { name, type, method, match } = request.body;

    await this.prisma.accessRule.create({
        data: {
            name: name,
            type: type,
            method: method,
            match: match,
        },
    });

    return reply.code(200).send({ status: "success", message: "Access Rule created" });
}

export async function createUploadTokenHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: CreateUploadTokenInput }>,
    reply: FastifyReply,
) {
    const user = await this.prisma.user.findUnique({ where: { id: request.user.id } });
    const folder = await this.prisma.folder.findUnique({ where: { id: request.body.folderId } });

    if (!user || !folder) {
        return reply.code(500).send({ message: "Something went wrong. Please try again" });
    }

    if (user.id != folder.ownerId) {
        return reply
            .code(403)
            .send({ message: "You do not have permission to create an upload token for this folder" });
    }

    const { description, folderId, fileAccess } = request.body;

    const uploadToken = await this.prisma.uploadToken.create({
        data: {
            user: {
                connect: { id: user.id },
            },
            description: description != undefined ? description : null,
            folderId: folderId,
            fileAccess: fileAccess,
        },
    });

    return reply.code(200).send({ uploadToken: this.jwt.sign({ id: uploadToken.id, type: "UploadToken" }) });
}
