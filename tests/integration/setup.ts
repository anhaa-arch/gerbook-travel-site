import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import typeDefs from '../../graphql/schema';
import resolvers from '../../graphql/resolvers';
import prisma from '../../prisma/client';

// Create a test server setup function
export const setupTestServer = async () => {
  // Create Express app
  const app = express();
  
  // Set up Apollo Server
  const schema = makeExecutableSchema({ typeDefs, resolvers });
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