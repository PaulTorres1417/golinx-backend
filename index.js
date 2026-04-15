import { runServerApollo } from "./src/app.js";
import { typeDefs } from "./src/graphql/schemas.js";
import { resolvers } from "./src/graphql/resolvers.js";

runServerApollo({ typeDefs, resolvers });