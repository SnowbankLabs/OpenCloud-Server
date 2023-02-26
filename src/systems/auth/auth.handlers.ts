import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as argon2 from "argon2";

import type { CreateUserInput, LoginInput } from "./auth.schemas";

export async function createUserHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
) {
    const { username, firstName, lastName, password } = request.body;

    try {
        const hashedPassword = await argon2.hash(password);

        const user = await this.prisma.user.create({
            data: {
                username: username,
                firstName: firstName != undefined ? firstName : null,
                lastName: lastName != undefined ? lastName : null,
                password: hashedPassword,
            },
        });

        return reply.code(201).send(user);
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
        return {
            accessToken: this.jwt.sign({ id: user.id }, { expiresIn: "15m" }),
        };
    }

    return reply.code(401).send({ message: "Invalid username or password" });
}

export async function infoHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
    const user = await this.prisma.user.findUnique({ where: { id: request.user.id } });

    if (!user) {
        return reply.code(500).send({ message: "Something went wrong. Please try again" });
    }

    return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
}
