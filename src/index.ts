// Environment variables must be loaded before anything else
import * as dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";

import prismaPlugin from "@utils/prisma";
import authenticationPlugin from "@utils/authentication";
import authRouter from "@systems/auth/auth.routes";
import { authSchemas } from "@systems/auth/auth.schemas";

// Initialize Fastify Instance
const server = Fastify({
    logger: true,
});

// Register Utility Plugins
void server.register(prismaPlugin);
void server.register(authenticationPlugin);

// Register Route Schemas
for (const schema of [...authSchemas]) {
    server.addSchema(schema);
}

// Register Routes
void server.register(authRouter, { prefix: "/api/auth" });

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
