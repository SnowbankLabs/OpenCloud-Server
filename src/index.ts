// Environment variables must be loaded before anything else
import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";

import prismaPlugin from "@utils/prisma";
import authenticationPlugin from "@utils/authentication";
import FastifyMultipart from "@fastify/multipart";
import FastifyStatic from "@fastify/static";
import path from "path";

import { env } from "@env/server";
import authRouter from "@systems/auth/auth.routes";
import { authSchemas } from "@systems/auth/auth.schemas";
import fileSystemRouter from "@systems/fs/fs.routes";
import { fsSchemas } from "@systems/fs/fs.schemas";

// Fastify Types
declare module "fastify" {
    interface FastifyRequest {
        authenticated: boolean;
    }
}

// Initialize Fastify Instance
const server = Fastify({
    logger: true,
});

// Register Utility Plugins
void server.register(prismaPlugin);
void server.register(authenticationPlugin);
void server.register(FastifyMultipart, {
    limits: {
        fileSize: 10 * 1024 * 1024 * 1024,
    },
});

if (env.NODE_ENV == "docker") {
    void server.register(FastifyStatic, {
        root: path.join("/", "FileStore"),
        prefix: "/FileStore/",
    });
} else {
    void server.register(FastifyStatic, {
        root: path.join(__dirname, "../", "FileStore"),
        prefix: "/FileStore/",
    });
}

// Register Route Schemas
for (const schema of [...authSchemas, ...fsSchemas]) {
    server.addSchema(schema);
}

// Register Routes
void server.register(authRouter, { prefix: "/api/auth" });
void server.register(fileSystemRouter, { prefix: "/api/files" });

// Server Health Check
server.get("/api/health", async () => {
    return { status: "OK" };
});

void (async () => {
    try {
        await server.listen({ port: 8080, host: "0.0.0.0" });

        console.log("Server listening at http://localhost:8080");
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
