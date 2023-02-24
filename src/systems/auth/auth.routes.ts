import type { FastifyInstance } from "fastify";

async function authRouter(server: FastifyInstance) {
    server.get("/", async () => {
        return { hello: "world" };
    });
}

export default authRouter;
