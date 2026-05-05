import { runServerApollo } from './app.ts';
import { typeDefs } from './graphql/schemas.ts';
import { resolvers } from './graphql/resolvers.ts';

void runServerApollo({ typeDefs, resolvers });
