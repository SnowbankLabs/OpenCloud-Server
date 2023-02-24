import type { FastifyInstance } from "fastify";

import { $ref } from "./auth.schemas";
import { createUserHandler, loginHandler } from "./auth.handlers";

async function authRouter(server: FastifyInstance) {
    server.route({
        method: "POST",
        url: "/create",
        schema: {
            body: $ref("createUserSchema"),
            response: $ref("createUserResponseSchema"),
        },
        handler: createUserHandler,
    });

    server.route({
        method: "POST",
        url: "/login",
        schema: {
            body: $ref("loginSchema"),
            response: $ref("loginResponseSchema"),
        },
        handler: loginHandler,
    });
}

export default authRouter;
