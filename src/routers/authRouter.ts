import type { FastifyInstance } from "fastify";

async function authRouter(app: FastifyInstance) {
    app.get("/", async () => {
        return { hello: "world" };
    });
}

export default authRouter;
