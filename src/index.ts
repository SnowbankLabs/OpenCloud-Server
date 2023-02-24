import Fastify from "fastify";

import prismaPlugin from "@utils/prisma";
import authRouter from "@systems/auth/auth.routes";

const server = Fastify({
    logger: true,
});

// Register Prisma Plugin
server.register(prismaPlugin);

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
