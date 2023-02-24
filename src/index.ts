// Environment variables must be loaded before anything else
import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import FastifyJWT from "@fastify/jwt";

import { env } from "@env/server";
import prismaPlugin from "@utils/prisma";
import authRouter from "@systems/auth/auth.routes";

// Initialize Fastify Instance
const server = Fastify({
    logger: true,
});

// Register Utility Plugins
server.register(prismaPlugin);
server.register(FastifyJWT, {
    secret: env.AUTH_SECRET,
});

server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

// Register Routes
server.register(authRouter, { prefix: "/api/auth" });

// Server Health Check
server.get("/api/health", async () => {
    return { status: "OK" };
});

(async () => {
    try {
        await server.listen({ port: 8080, host: "0.0.0.0" });

        console.log("Server listening at http://localhost:8080");
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
