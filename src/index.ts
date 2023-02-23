import fastify from "fastify";

import prismaPlugin from "@plugins/prisma";
import authRouter from "@routers/authRouter";

const app = fastify({
    logger: true,
});

// Register Prisma Plugin
app.register(prismaPlugin);

// Register Routes
app.register(authRouter, { prefix: "/api/auth" });

(async () => {
    try {
        await app.listen({ port: 8080 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
})();
