import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as argon2 from "argon2";

import type { CreateUserInput, LoginInput } from "./auth.schemas";

export async function createUserHandler(
    this: FastifyInstance,
    request: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply,
) {
    const prisma = this.prisma;
    const { password, ...rest } = request.body;

    try {
        const hashedPassword = await argon2.hash(password);

        const user = await prisma.user.create({
            data: { ...rest, password: hashedPassword },
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
    const prisma = this.prisma;
    const body = request.body;

    const user = await prisma.user.findUnique({
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
