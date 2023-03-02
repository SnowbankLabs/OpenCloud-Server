import type { FastifyInstance } from "fastify";

import { $ref } from "./auth.schemas";
import { createUserHandler, loginHandler, infoHandler } from "./auth.handlers";

async function authRouter(server: FastifyInstance) {
    server.route({
        method: "POST",
        url: "/create",
        schema: {
            body: $ref("createUserSchema"),
            response: { 201: $ref("createUserResponseSchema") },
        },
        handler: createUserHandler,
    });

    server.route({
        method: "POST",
        url: "/login",
        schema: {
            body: $ref("loginSchema"),
            response: { 200: $ref("loginResponseSchema") },
        },
        handler: loginHandler,
    });

    server.route({
        method: "GET",
        url: "/info",
        onRequest: [server.authenticate],
        schema: {
            response: { 200: $ref("createUserResponseSchema") },
        },
        handler: infoHandler,
    });
}

export default authRouter;
