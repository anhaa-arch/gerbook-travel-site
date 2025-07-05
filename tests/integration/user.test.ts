import request from 'supertest';
import { Server } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { setupTestServer, closeTestServer } from './setup';
import prisma from '../../prisma/client';
import * as jwtUtils from '../../utils/auth/jwt';
import * as passwordUtils from '../../utils/auth/password';

// Mock the JWT and password utilities
jest.mock('../../utils/auth/jwt');
jest.mock('../../utils/auth/password');

describe('User API Integration Tests', () => {
  let server: Server;
  let apolloServer: ApolloServer;
  let url: string;

  // Mock user data
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock admin user data
  const mockAdminUser = {
    id: 'admin123',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashedPassword',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeAll(async () => {
    // Set up test server
    const testServer = await setupTestServer();
    server = testServer.server;
    apolloServer = testServer.apolloServer;
    url = testServer.url;
  });

  afterAll(async () => {
    // Close test server
    await closeTestServer(server, apolloServer);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Queries', () => {
    describe('me', () => {
      it('should return the current user', async () => {
        // Mock getUserId to return the user ID
        (jwtUtils.getUserId as jest.Mock).mockReturnValue('user123');
        
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Define the query
        const query = `
          query {
            me {
              id
              name
              email
              role
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .set('Authorization', 'Bearer test_token')
          .send({ query });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.data.me).toEqual({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        });
      });

      it('should return an error if not authenticated', async () => {
        // Mock getUserId to throw an error
        (jwtUtils.getUserId as jest.Mock).mockImplementation(() => {
          throw new Error('Not authenticated');
        });
        
        // Define the query
        const query = `
          query {
            me {
              id
              name
              email
              role
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Not authenticated');
      });
    });
  });

  describe('Mutations', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        // Mock prisma.user.findUnique to return null (user doesn't exist)
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
        // Mock hashPassword to return a hashed password
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
        
        // Mock prisma.user.create to return the new user
        const newUser = {
          id: 'new123',
          name: 'New User',
          email: 'new@example.com',
          password: 'hashedPassword',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
        
        // Mock generateToken to return a token
        (jwtUtils.generateToken as jest.Mock).mockReturnValue('new_token');
        
        // Define the mutation
        const mutation = `
          mutation {
            register(input: {
              name: "New User",
              email: "new@example.com",
              password: "password123"
            }) {
              token
              user {
                id
                name
                email
                role
              }
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query: mutation });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.data.register).toEqual({
          token: 'new_token',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        });
      });

      it('should return an error if email already exists', async () => {
        // Mock prisma.user.findUnique to return an existing user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Define the mutation
        const mutation = `
          mutation {
            register(input: {
              name: "New User",
              email: "test@example.com",
              password: "password123"
            }) {
              token
              user {
                id
                name
                email
                role
              }
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query: mutation });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Email already in use');
      });
    });

    describe('login', () => {
      it('should login a user with valid credentials', async () => {
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Mock comparePassword to return true
        (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
        
        // Mock generateToken to return a token
        (jwtUtils.generateToken as jest.Mock).mockReturnValue('test_token');
        
        // Define the mutation
        const mutation = `
          mutation {
            login(email: "test@example.com", password: "password123") {
              token
              user {
                id
                name
                email
                role
              }
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query: mutation });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.data.login).toEqual({
          token: 'test_token',
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          }
        });
      });

      it('should return an error if user does not exist', async () => {
        // Mock prisma.user.findUnique to return null
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
        // Define the mutation
        const mutation = `
          mutation {
            login(email: "nonexistent@example.com", password: "password123") {
              token
              user {
                id
                name
                email
                role
              }
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query: mutation });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Invalid email or password');
      });

      it('should return an error if password is invalid', async () => {
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Mock comparePassword to return false
        (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);
        
        // Define the mutation
        const mutation = `
          mutation {
            login(email: "test@example.com", password: "wrongpassword") {
              token
              user {
                id
                name
                email
                role
              }
            }
          }
        `;
        
        // Make the request
        const response = await request(url)
          .post('')
          .send({ query: mutation });
        
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Invalid email or password');
      });
    });
  });
});