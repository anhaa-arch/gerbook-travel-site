import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { User } from '@prisma/client';
import { hashPassword, comparePassword } from '../../utils/auth/password';
import { generateToken } from '../../utils/auth/jwt';
import { validateInput, userSchemas, authSchemas } from '../../utils/validation';
import { sendMail } from '../../utils/mailer';
import smsProvider, { generateOtp } from '../../utils/smsProvider';
import { generateSecureToken, hashToken } from '../../utils/security';
import {auditUserAction, auditUserLogin, AuditAction, auditEntityAction} from '../../utils/audit';

interface Context {
  prisma: any;
  req: any;
}

const normalizePhone = (phone?: string | null) => {
  if (!phone) return phone;
  let p = phone.toString().trim();
  // Remove spaces and common separators
  p = p.replace(/[^0-9+]/g, '');
  if (p.startsWith('+')) {
    return p;
  }
  // If starts with country code without + (e.g., 976123...), add +
  if (p.startsWith('976')) return '+' + p;
  // If local 8-9 digit number, assume Mongolian and prefix +976
  if (/^\d{8,9}$/.test(p)) return '+976' + p;
  return p;
}

interface AuthPayload {
  token: string;
  user: User;
}

const userResolvers = {
  Query: {
    // Get the currently authenticated user
    me: async (_: any, __: any, context: Context) => {
      const userId = require('../../utils/auth/jwt').getUserId(context);
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
      if (!require('../../utils/auth/jwt').isAdmin(context)) {
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
        require('../../utils/auth/jwt').getUserId(context),
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
      if (!require('../../utils/auth/jwt').isAdmin(context)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }

      const user = await context.prisma.user.findUnique({ where: { id } });

      // Log user retrieval in audit
      await auditUserAction(
        context.prisma,
        require('../../utils/auth/jwt').getUserId(context), // Admin user ID
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
        userId = require('../../utils/auth/jwt').getUserId(context);
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

      // Normalize phone for storage (keep consistent format)
      const normalizedPhone = normalizePhone(validatedInput.phone as string | undefined);

      // Create user (store normalized phone)
      const user = await context.prisma.user.create({
        data: {
          ...validatedInput,
          phone: normalizedPhone,
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

    // Forgot password - create reset token and send via email or SMS
    forgotPassword: async (_: any, { email }: { email: string }, context: Context) => {
      // Validate input (simple email validation)
      validateInput({ email }, authSchemas.passwordResetRequest);

      const user = await context.prisma.user.findUnique({ where: { email } });
      if (!user) {
        // avoid leaking whether user exists
        return { message: 'If an account with that email exists, a reset link will be sent.' };
      }

      // Create secure reset token (store hash in DB, send raw token to user)
      const rawToken = generateSecureToken(24)
      const tokenHash = hashToken(rawToken)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await context.prisma.token.create({
        data: {
          userId: user.id,
          token: tokenHash,
          type: 'PASSWORD_RESET',
          expiresAt
        }
      });

      // Send email with reset link (frontend should have route to handle /reset?token=...)
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(rawToken)}`;
      const msg = `Reset password link: ${resetLink}. This link expires in 1 hour.`;

      try {
        await sendMail({ email: user.email, msg });
      } catch (err) {
        console.error('Error sending reset email', err);
      }

      return { message: 'If an account with that email exists, a reset link will be sent.' };
    },

    // Reset password using token
    resetPassword: async (_: any, { token, newPassword }: { token: string; newPassword: string }, context: Context): Promise<AuthPayload> => {
      // Validate new password
      validateInput({ token, newPassword }, authSchemas.passwordReset);

    // Find token in DB (token stored as hash)
    const tokenHash = hashToken(token)
    const tokenRecord = await context.prisma.token.findUnique({ where: { token: tokenHash } });
      if (!tokenRecord) {
        throw new Error('Invalid or expired token');
      }

      if (tokenRecord.used || tokenRecord.expiresAt < new Date()) {
        throw new Error('Invalid or expired token');
      }

      // Get user
      const user = await context.prisma.user.findUnique({ where: { id: tokenRecord.userId } });
      if (!user) throw new Error('User not found');

      // Hash new password and update
      const hashed = await hashPassword(newPassword);
      await context.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

      // Mark token used
      await context.prisma.token.update({ where: { id: tokenRecord.id }, data: { used: true } });

      // Generate auth token
      const authToken = generateToken(user as any);

      return { token: authToken, user };
    },

    // Send OTP to phone (creates OTP token in DB)
    sendOtp: async (_: any, { phone }: { phone: string }, context: Context) => {
      // Validate phone
      validateInput({ phone }, authSchemas.sendOtp);

      // Normalize phone for consistent token creation and lookup
      const normalizedPhone = normalizePhone(phone);

      // Generate 6-digit OTP
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Upsert user if not exists? For OTP send we don't create user yet. Just create token linked to any existing user or null.
  let user = await context.prisma.user.findUnique({ where: { phone: normalizedPhone } as any });

      // If no user, we won't create one now; when verifying OTP we will create the user if desired
      const tokenData: any = {
        token: otp,
        type: 'OTP',
        expiresAt,
        identifier: normalizedPhone
      };
      if (user) tokenData.userId = user.id;

      await context.prisma.token.create({ data: tokenData });

      // Send via SMS (dev stub)
      try {
        await smsProvider.sendSms(normalizedPhone as string, `Your verification code is: ${otp}`);
      } catch (err) {
        console.error('SMS send error', err);
      }

      return { message: 'OTP илгээлээ' };
    },

    // Verify OTP and log in / create user
    verifyOtp: async (_: any, { phone, otp }: { phone: string; otp: string }, context: Context): Promise<AuthPayload> => {
      // Validate input
      validateInput({ phone, otp }, authSchemas.verifyOtp);

      const normalizedPhone = normalizePhone(phone);

      // Find most recent OTP token for this phone that matches
      const tokenRecord = await context.prisma.token.findFirst({
        where: { token: otp, type: 'OTP', identifier: normalizedPhone, used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' }
      });

      if (!tokenRecord) {
        throw new Error('OTP буруу эсвэл хугацаа дууссан байна');
      }

      // If tokenRecord not linked to a user, try to find user by phone
      let user = null;
  try { user = await context.prisma.user.findUnique({ where: { phone: normalizedPhone } as any }); } catch (e) { /* ignore */ }

      // If user doesn't exist, create one with phone as identifier
      if (!user) {
        user = await context.prisma.user.create({ data: { email: `${normalizedPhone}@no-email.local`, name: normalizedPhone, phone: normalizedPhone, password: '' } });
      }

      // Mark token used
      await context.prisma.token.update({ where: { id: tokenRecord.id }, data: { used: true } });

      // Generate JWT
      const authToken = generateToken(user as any);

      return { token: authToken, user };
    },

    // Update a user (admin can update any user, users can only update themselves)
    updateUser: async (_: any, { id, input }: { id: string; input: any }, context: Context): Promise<User> => {
      let userId: string | undefined;
      let isUserAdmin = false;
      try {
        userId = require('../../utils/auth/jwt').getUserId(context);
      } catch (err) {
        if (process.env.NODE_ENV === 'test') {
          // eslint-disable-next-line no-console
          console.error('[debug] getUserId threw:', err && err.message ? err.message : err);
        }
      }
      try {
        isUserAdmin = require('../../utils/auth/jwt').isAdmin(context);
      } catch (err) {
        if (process.env.NODE_ENV === 'test') {
          // eslint-disable-next-line no-console
          console.error('[debug] isAdmin threw:', err && err.message ? err.message : err);
        }
      }

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
      if (!require('../../utils/auth/jwt').isAdmin(context)) {
        throw new ForbiddenError('Not authorized to delete users');
      }

      // Get the admin user ID for audit logging
      let adminUserId: string | undefined;
      try {
        adminUserId = require('../../utils/auth/jwt').getUserId(context);
      } catch (err) {
        if (process.env.NODE_ENV === 'test') {
          // eslint-disable-next-line no-console
          console.error('[debug] getUserId (admin) threw:', err && err.message ? err.message : err);
        }
      }

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
