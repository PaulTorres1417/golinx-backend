import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { createLoaders } from './config/loader/index.js';
import authRoutes  from './auth/auth.routes.js';
import './auth/passport.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const runServerApollo = async ({ typeDefs, resolvers }) => {

  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(authRoutes);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({
    schema,
    context: async (ctx, msg, args) => {
      const raw = ctx.connectionParams?.authorization || "";
      const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
      let user = null;
      try {
        user = jwt.verify(token, process.env.SECRET_KEY);
      } catch {
        user = null;
      }
      return {
        user,
        loaders: createLoaders() 
      }
    },
  },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          }
        }
      }
    ]
  });
  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const raw = req.headers.authorization || "";
        const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
        let user = null;
        try {
          user = jwt.verify(token, process.env.SECRET_KEY);
        } catch {
          user = null;
        }
        return {
          user,
          res,
          loaders: createLoaders()
        }
      },
    })
  );


  const PORT = process.env.PORT;
  httpServer.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}/graphql`);
    console.log(`🚀 ws://localhost:${PORT}/graphql`);
  });
}