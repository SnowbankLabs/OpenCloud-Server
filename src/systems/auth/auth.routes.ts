import type { FastifyInstance } from "fastify";

import { $ref } from "./auth.schemas";
import { createUserHandler, loginHandler, refreshHandler, infoHandler } from "./auth.handlers";

async function authRouter(server: FastifyInstance) {
    server.route({
        method: "POST",
        url: "/create",
        schema: {
            body: $ref("createUserSchema"),
            response: { 201: $ref("userInfoResponseSchema") },
        },
        handler: createUserHandler,
    });

    server.route({
        method: "POST",
        url: "/login",
        schema: {
            body: $ref("loginSchema"),
            response: { 200: $ref("credentialsResponseSchema") },
        },
        handler: loginHandler,
    });

    server.route({
        method: "POST",
        url: "/refresh",
        schema: {
            body: $ref("refreshSchema"),
            response: { 200: $ref("credentialsResponseSchema") },
        },
        handler: refreshHandler,
    })

    server.route({
        method: "GET",
        url: "/info",
        onRequest: [server.authenticate],
        schema: {
            response: { 200: $ref("userInfoResponseSchema") },
        },
        handler: infoHandler,
    });
}

export default authRouter;
