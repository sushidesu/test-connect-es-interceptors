import type { ConnectRouter } from "@connectrpc/connect"
import { ElizaService } from "../gen/eliza_connect"
import { fastify } from "fastify"
import { fastifyConnectPlugin } from "@connectrpc/connect-fastify"

const elizaService = (router: ConnectRouter) =>
  // registers connectrpc.eliza.v1.ElizaService
  router.service(
    ElizaService,
    {
      async say(req) {
        return {
          sentence: `You said: ${req.sentence}`,
        }
      },
    },
    {
      interceptors: [
        (next) => async (req) => {
          console.log("2. service interceptor")
          return await next(req)
        },
      ],
    }
  )

async function main() {
  const server = fastify()
  await server.register(fastifyConnectPlugin, {
    routes: (router) => {
      elizaService(router)
    },
    interceptors: [
      // ignored
      (next) => async (req) => {
        console.log("1. root interceptor")
        return await next(req)
      },
    ],
  })
  await server.listen({ host: "localhost", port: 8080 })
  console.log("server is listening at", server.addresses())
}

void main()
