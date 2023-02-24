import Fastify from "fastify";

import prismaPlugin from "@plugins/prisma";
import authRouter from "@routers/authRouter";

const server = Fastify({
    logger: true,
});

// Register Prisma Plugin
server.register(prismaPlugin);

// Register Routes
server.register(authRouter, { prefix: "/api/auth" });

(async () => {
    try {
        await server.listen({ port: 3000, host: "0.0.0.0" });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
