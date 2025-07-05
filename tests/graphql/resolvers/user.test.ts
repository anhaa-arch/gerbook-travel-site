import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import userResolvers from '../../../graphql/resolvers/user';
import * as jwtUtils from '../../../utils/auth/jwt';
import * as passwordUtils from '../../../utils/auth/password';
import prisma from '../../../prisma/client';

// Mock the JWT and password utilities
jest.mock('../../../utils/auth/jwt');
jest.mock('../../../utils/auth/password');

describe('User Resolvers', () => {
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

  // Mock context
  const mockContext = {
    prisma,
    req: {
      headers: {
        authorization: 'Bearer test_token'
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('me', () => {
      it('should return the current user', async () => {
        // Mock getUserId to return the user ID
        (jwtUtils.getUserId as jest.Mock).mockReturnValue('user123');
        
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        const result = await userResolvers.Query.me(null, {}, mockContext);
        
        // Check that getUserId was called with the context
        expect(jwtUtils.getUserId).toHaveBeenCalledWith(mockContext);
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user123' }
        });
        
        // Check that the function returns the user
        expect(result).toEqual(mockUser);
      });
    });

    describe('users', () => {
      it('should return a list of users if user is admin', async () => {
        // Mock isAdmin to return true
        (jwtUtils.isAdmin as jest.Mock).mockReturnValue(true);
        
        // Mock prisma.user.count to return the count
        (prisma.user.count as jest.Mock).mockResolvedValue(10);
        
        // Mock prisma.user.findMany to return the users
        (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser, mockAdminUser]);
        
        const result = await userResolvers.Query.users(null, { first: 10 }, mockContext);
        
        // Check that isAdmin was called with the context
        expect(jwtUtils.isAdmin).toHaveBeenCalledWith(mockContext);
        
        // Check that prisma.user.count was called
        expect(prisma.user.count).toHaveBeenCalled();
        
        // Check that prisma.user.findMany was called with the correct parameters
        expect(prisma.user.findMany).toHaveBeenCalledWith({
          where: {},
          take: 10,
          skip: 0,
          cursor: undefined,
          orderBy: { createdAt: 'desc' }
        });
        
        // Check that the function returns the expected structure
        expect(result).toEqual({
          edges: [
            { node: mockUser, cursor: mockUser.id },
            { node: mockAdminUser, cursor: mockAdminUser.id }
          ],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: mockUser.id,
            endCursor: mockAdminUser.id
          },
          totalCount: 10
        });
      });

      it('should throw ForbiddenError if user is not admin', async () => {
        // Mock isAdmin to return false
        (jwtUtils.isAdmin as jest.Mock).mockReturnValue(false);
        
        // Check that the function throws ForbiddenError
        await expect(userResolvers.Query.users(null, {}, mockContext))
          .rejects.toThrow(ForbiddenError);
        
        // Check that isAdmin was called with the context
        expect(jwtUtils.isAdmin).toHaveBeenCalledWith(mockContext);
      });
    });

    describe('user', () => {
      it('should return a user by ID if user is admin', async () => {
        // Mock isAdmin to return true
        (jwtUtils.isAdmin as jest.Mock).mockReturnValue(true);
        
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        const result = await userResolvers.Query.user(null, { id: 'user123' }, mockContext);
        
        // Check that isAdmin was called with the context
        expect(jwtUtils.isAdmin).toHaveBeenCalledWith(mockContext);
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user123' }
        });
        
        // Check that the function returns the user
        expect(result).toEqual(mockUser);
      });

      it('should throw ForbiddenError if user is not admin', async () => {
        // Mock isAdmin to return false
        (jwtUtils.isAdmin as jest.Mock).mockReturnValue(false);
        
        // Check that the function throws ForbiddenError
        await expect(userResolvers.Query.user(null, { id: 'user123' }, mockContext))
          .rejects.toThrow(ForbiddenError);
        
        // Check that isAdmin was called with the context
        expect(jwtUtils.isAdmin).toHaveBeenCalledWith(mockContext);
      });
    });
  });

  describe('Mutation', () => {
    describe('register', () => {
      it('should register a new user', async () => {
        // Mock input
        const input = {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123'
        };
        
        // Mock prisma.user.findUnique to return null (user doesn't exist)
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
        // Mock hashPassword to return a hashed password
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
        
        // Mock prisma.user.create to return the new user
        (prisma.user.create as jest.Mock).mockResolvedValue({
          ...input,
          id: 'new123',
          password: 'hashedPassword',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Mock generateToken to return a token
        (jwtUtils.generateToken as jest.Mock).mockReturnValue('new_token');
        
        const result = await userResolvers.Mutation.register(null, { input }, mockContext);
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: input.email }
        });
        
        // Check that hashPassword was called with the password
        expect(passwordUtils.hashPassword).toHaveBeenCalledWith(input.password);
        
        // Check that prisma.user.create was called with the correct parameters
        expect(prisma.user.create).toHaveBeenCalledWith({
          data: {
            ...input,
            password: 'hashedPassword'
          }
        });
        
        // Check that generateToken was called with the new user
        expect(jwtUtils.generateToken).toHaveBeenCalled();
        
        // Check that the function returns the expected structure
        expect(result).toEqual({
          token: 'new_token',
          user: expect.objectContaining({
            id: 'new123',
            email: input.email
          })
        });
      });

      it('should throw an error if email already exists', async () => {
        // Mock input
        const input = {
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123'
        };
        
        // Mock prisma.user.findUnique to return an existing user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Check that the function throws an error
        await expect(userResolvers.Mutation.register(null, { input }, mockContext))
          .rejects.toThrow('Email already in use');
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: input.email }
        });
      });
    });

    describe('login', () => {
      it('should login a user with valid credentials', async () => {
        // Mock credentials
        const credentials = {
          email: 'test@example.com',
          password: 'password123'
        };
        
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Mock comparePassword to return true
        (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
        
        // Mock generateToken to return a token
        (jwtUtils.generateToken as jest.Mock).mockReturnValue('test_token');
        
        const result = await userResolvers.Mutation.login(
          null,
          credentials,
          mockContext
        );
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: credentials.email }
        });
        
        // Check that comparePassword was called with the correct parameters
        expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
          credentials.password,
          mockUser.password
        );
        
        // Check that generateToken was called with the user
        expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockUser);
        
        // Check that the function returns the expected structure
        expect(result).toEqual({
          token: 'test_token',
          user: mockUser
        });
      });

      it('should throw AuthenticationError if user does not exist', async () => {
        // Mock credentials
        const credentials = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };
        
        // Mock prisma.user.findUnique to return null
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        
        // Check that the function throws AuthenticationError
        await expect(userResolvers.Mutation.login(null, credentials, mockContext))
          .rejects.toThrow(AuthenticationError);
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: credentials.email }
        });
      });

      it('should throw AuthenticationError if password is invalid', async () => {
        // Mock credentials
        const credentials = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };
        
        // Mock prisma.user.findUnique to return the user
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        
        // Mock comparePassword to return false
        (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);
        
        // Check that the function throws AuthenticationError
        await expect(userResolvers.Mutation.login(null, credentials, mockContext))
          .rejects.toThrow(AuthenticationError);
        
        // Check that prisma.user.findUnique was called with the correct parameters
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: credentials.email }
        });
        
        // Check that comparePassword was called with the correct parameters
        expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
          credentials.password,
          mockUser.password
        );
      });
    });
  });
});