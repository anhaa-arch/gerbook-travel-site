import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
// Delay importing schema and resolvers until setupTestServer runs so tests can
// mock dependencies (like auth utilities) before modules are evaluated.
let lazyTypeDefs: any = null;
let lazyResolvers: any = null;
// Import prisma dynamically inside setupTestServer so jest mocks in
// setupFilesAfterEnv can replace it.

// Create a test server setup function
export const setupTestServer = async () => {
  // Create Express app
  const app = express();
  
  // Lazily import schema and resolvers to ensure any jest mocks in the test
  // file are registered before these modules are loaded.
  if (!lazyTypeDefs) {
    lazyTypeDefs = (await import('../../graphql/schema')).default;
  }
  if (!lazyResolvers) {
    lazyResolvers = (await import('../../graphql/resolvers')).default;
  }

  // Use a dynamically-required prisma so jest's module mock for prisma/client
  // (registered in tests/setup.ts) is respected. The jest mock returns the
  // mock object directly, so require(...) returns the mock itself (not a
  // default export).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const prisma = require('../../prisma/client');

  // Set up Apollo Server
  const schema = makeExecutableSchema({ typeDefs: lazyTypeDefs, resolvers: lazyResolvers });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({
      prisma,
      req
    })
  });
  
  // Start Apollo Server
  await apolloServer.start();
  
  // Apply middleware
  apolloServer.applyMiddleware({ app, path: '/graphql' });
  
  // Start server on a random port
  const server = app.listen(0);
  
  // Get the port
  const { port } = server.address() as AddressInfo;
  
  // Return server and URL
  return {
    server,
    url: `http://localhost:${port}/graphql`,
    apolloServer
  };
};

// Close test server
export const closeTestServer = async (
  server: Server,
  apolloServer: ApolloServer
) => {
  await apolloServer.stop();
  server.close();
};