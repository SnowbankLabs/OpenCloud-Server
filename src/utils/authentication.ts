import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import FastifyJWT from "@fastify/jwt";
import fp from "fastify-plugin";

import { env } from "@env/server";

// Use TypeScript module augmentation to declare the type of server.authenticate to be JWT authentication function
declare module "fastify" {
    interface FastifyInstance {
        authenticate: any;
    }
}

const authenticationPlugin: FastifyPluginAsync = fp(async (server, options) => {
    server.register(FastifyJWT, {
        secret: env.AUTH_SECRET,
    });

    // Make JWT verification/decode available through the fastify server instance: server.authentication
    server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});

export default authenticationPlugin;
