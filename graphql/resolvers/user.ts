import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { User } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/auth/password';
import { generateToken, getUserId, isAdmin } from '../../utils/auth/jwt';
import { validateInput, userSchemas } from '../../utils/validation';
import {auditUserAction, auditUserLogin, AuditAction, auditEntityAction} from '../../utils/audit';

interface Context {
  prisma: any;
  req: any;
}

interface AuthPayload {
  token: string;
  user: User;
}

const userResolvers = {
  Query: {
    // Get the currently authenticated user
    me: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context);
      const user = await context.prisma.user.findUnique({ where: { id: userId } });

      // Log user read in audit
      await auditUserAction(
        context.prisma,
        userId,
        AuditAction.READ,
        userId,
        'User retrieved own profile'
      );

      return user;
    },

    // Get a list of users (admin only)
    users: async (_: any, args: any, context: Context) => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      const { first = 10, after, last, before, filter, orderBy } = args;

      // Build the where clause for filtering
      const where = filter ? {
        OR: [
          { name: { contains: filter } },
          { email: { contains: filter } }
        ]
      } : {};

      // Get total count
      const totalCount = await context.prisma.user.count({ where });

      // Get users with pagination
      const users = await context.prisma.user.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: orderBy ? { [orderBy.split('_')[0]]: orderBy.split('_')[1].toLowerCase() } : { createdAt: 'desc' }
      });

      // Create edges and pageInfo
      const edges = users.map(user => ({
        node: user,
        cursor: user.id
      }));

      const pageInfo = {
        hasNextPage: users.length === first,
        hasPreviousPage: !!after,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
      };

      // Log users listing in audit
      await auditEntityAction(
        context.prisma,
        getUserId(context),
        AuditAction.READ,
        'deUserList',
        'all', // No specific entity ID for a list
        `Admin listed users with filter: ${filter || 'none'}`
      );

      return {
        edges,
        pageInfo,
        totalCount
      };
    },

    // Get a user by ID (admin only)
    user: async (_: any, { id }: { id: string }, context: Context) => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      const user = await context.prisma.user.findUnique({ where: { id } });

      // Log user retrieval in audit
      await auditUserAction(
        context.prisma,
        getUserId(context), // Admin user ID
        AuditAction.READ,
        id, // Target user ID
        `Admin retrieved user details`
      );

      return user;
    },

    // Get a simple list of all users
    allUsers: async (_: any, __: any, context: Context) => {
      const users = await context.prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Try to get the user ID if authenticated
      let userId;
      try {
        userId = getUserId(context);
      } catch (error) {
        // User might not be authenticated, continue without user ID
      }

      // Log all users retrieval in audit
      await auditEntityAction(
        context.prisma,
        userId, // May be undefined if not authenticated
        AuditAction.READ,
        'UserList',
        'all',
        `Retrieved simple list of all users`
      );

      return users;
    }
  },

  Mutation: {
    // Register a new user
    register: async (_: any, { input }: { input: any }, context: Context): Promise<AuthPayload> => {
      // Validate input
      const validatedInput = validateInput(input, userSchemas.register);

      // Check if email already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email: validatedInput.email }
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedInput.password);

      // Create user
      const user = await context.prisma.user.create({
        data: {
          ...validatedInput,
          password: hashedPassword
        }
      });

      // Log user creation in audit
      await auditUserAction(
        context.prisma,
        undefined, // No user ID for registration (user is being created)
        AuditAction.CREATE,
        user.id,
        `User registered with email: ${user.email}`
      );

      // Generate token
      const token = generateToken(user);

      return { token, user };
    },

    // Login a user
    login: async (_: any, { email, password }: { email: string; password: string }, context: Context): Promise<AuthPayload> => {
      // Validate input
      validateInput({ email, password }, userSchemas.login);

      // Find user by email
      const user = await context.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user);

      // Log user login in audit
      await auditUserLogin(
        context.prisma,
        user.id
      );

      return { token, user };
    },

    // Update a user (admin can update any user, users can only update themselves)
    updateUser: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<User> => {
      const userId = getUserId(context);
      const isUserAdmin = isAdmin(context);

      // Check if user is authorized to update this user
      if (id !== userId && !isUserAdmin) {
        throw new ForbiddenError('Not authorized to update this user');
      }

      // Validate input
      const validatedInput = validateInput(input, userSchemas.update);

      // Prepare update data
      const updateData: any = { ...validatedInput };

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      // Update user
      const updatedUser = await context.prisma.user.update({
        where: { id },
        data: updateData
      });

      // Log user update in audit
      await auditUserAction(
        context.prisma,
        userId, // ID of the user performing the update
        AuditAction.UPDATE,
        id, // ID of the user being updated
        `User updated: ${JSON.stringify(Object.keys(validatedInput))}`
      );

      return updatedUser;
    },

    // Delete a user (admin only)
    deleteUser: async (_: any, { id }: { id: string }, context: Context): Promise<boolean> => {
      if (!isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete users');
      }

      // Get the admin user ID for audit logging
      const adminUserId = getUserId(context);

      // Get user details before deletion for audit log
      const userToDelete = await context.prisma.user.findUnique({
        where: { id },
        select: { email: true, name: true }
      });

      await context.prisma.user.delete({
        where: { id }
      });

      // Log user deletion in audit
      await auditUserAction(
        context.prisma,
        adminUserId, // ID of the admin performing the deletion
        AuditAction.DELETE,
        id, // ID of the user being deleted
        `User deleted: ${userToDelete?.email || 'unknown'}`
      );

      return true;
    }
  }
};

export default userResolvers;
