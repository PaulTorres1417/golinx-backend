import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createLoaders } from './config/loader/index.ts';
import authRoutes from './auth/auth.routes.ts';
import './auth/passport.ts';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

type UserPayload = {
  userId: string;
};

const extractUser = (token: string): UserPayload | null => {
  try {
    const secret = process.env.SECRET_KEY;
    if (!secret || !token) return null;
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (!payload.userId) return null;
    return { userId: payload.userId as string };

  } catch (err: unknown) {
    if ((err as { name?: string })?.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    console.log('error en verify:', err);
    return null;
  }
};
const getTokenFromBearer = (raw: string): string => {
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
};

export const runServerApollo = async ({
  typeDefs,
  resolvers,
}: {
  typeDefs: IExecutableSchemaDefinition['typeDefs'];
  resolvers: IExecutableSchemaDefinition['resolvers'];
}) => {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(authRoutes);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const raw = String(
          (ctx.connectionParams as Record<string, unknown> | undefined)
            ?.authorization ?? ''
        );
        const token = getTokenFromBearer(raw);
        const user = extractUser(token);
        return {
          user,
          loaders: createLoaders(),
        };
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
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const raw = String(req.headers.authorization ?? '');
        const token = getTokenFromBearer(raw);
        const user = extractUser(token);
        return {
          user,
          res,
          loaders: createLoaders(),
        };
      },
    })
  );

  const PORT = process.env.PORT;
  httpServer.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}/graphql`);
    console.log(`🚀 ws://localhost:${PORT}/graphql`);
  });
};