import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import logger from "./middleware/logger";
import errorHandler from "./middleware/error";
import prisma from "./prisma/client";
import authRoutes from './routes/auth'

// Define Apollo context type for code generation
export interface ApolloContext {
  prisma: typeof prisma;
  req: any; // Using any to bypass type checking for now
}

// Load environment variables
dotenv.config();

// Import GraphQL schema and resolvers (to be created)
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/v1/auth", authLimiter);

// Middleware
app.use(logger);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(__dirname + "/public/uploads"));

// Auth routes (Google OAuth callback etc.)
app.use('/api/auth', authRoutes)

// Set up Apollo Server
const schema = makeExecutableSchema({ typeDefs, resolvers });
const apolloServer = new ApolloServer({
  schema,
  context: ({ req }): ApolloContext => ({
    prisma,
    req
  })
});

// Start Apollo Server and apply middleware
async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app: app as any, path: "/graphql" });

  console.log(`GraphQL endpoint available at /graphql`);
}

// Start Apollo Server
startApolloServer().catch(err => {
  console.error("Failed to start Apollo Server:", err);
});

// Global error handler
app.use(errorHandler);

// Start Express server
const server = app.listen(
  process.env.PORT,
  () => console.log(`Express server is running on port ${process.env.PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise: Promise<any>) => {
  console.log(`Unhandled rejection error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
