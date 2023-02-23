import Fastify from "fastify";

import prismaPlugin from "@plugins/prisma";
import authRouter from "@routers/authRouter";

const app = Fastify({
    logger: true,
});

// Register Prisma Plugin
app.register(prismaPlugin);

// Register Routes
app.register(authRouter, { prefix: "/api/auth" });

app.listen({ port: 8080 }, function (err, address) {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
