// Note: use a loose 'any' type for prisma here because tests often pass
// a mocked prisma object that doesn't match the full PrismaClient shape.

/**
 * Enum representing different types of actions that can be audited
 */
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  OTHER = 'OTHER'
}

/**
 * Interface for the audit log entry
 */
interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details?: string;
}

/**
 * Creates an audit log entry
 * 
 * @param prisma - Prisma client instance
 * @param params - Audit log parameters
 * @returns The created audit log entry
 */
export const createAuditLog = async (
  prisma: any /* PrismaClient | mocked prisma in tests */,
  params: AuditLogParams
) => {
  // Defensive: some tests/mocks may not provide prisma.audit or may pass a partial/mock prisma.
  if (!prisma || !prisma.audit || typeof prisma.audit.create !== 'function') {
    // Audit is not available in this context (likely a unit test). Skip silently.
    // Keep a lightweight log for debugging when not in test environment.
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Audit logging skipped: prisma.audit.create not available');
    }
    return null;
  }

  try {
    const { userId, action, entityType, entityId, details } = params;

    const auditLog = await prisma.audit.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details || null
      }
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw the error to prevent disrupting the main operation
    // Just log it and return null
    return null;
  }
};

/**
 * Helper function to create audit logs for user-related actions
 * 
 * @param prisma - Prisma client instance
 * @param userId - ID of the user performing the action (optional)
 * @param action - Type of action being performed
 * @param targetUserId - ID of the user being acted upon
 * @param details - Additional details about the action (optional)
 */
export const auditUserAction = async (
  prisma: any,
  userId: string | undefined,
  action: AuditAction,
  targetUserId: string,
  details?: string
) => {
  return createAuditLog(prisma, {
    userId,
    action,
    entityType: 'User',
    entityId: targetUserId,
    details
  });
};

/**
 * Helper function to log user login events
 * 
 * @param prisma - Prisma client instance
 * @param userId - ID of the user logging in
 */
export const auditUserLogin = async (
  prisma: any,
  userId: string
) => {
  return createAuditLog(prisma, {
    userId,
    action: AuditAction.LOGIN,
    entityType: 'User',
    entityId: userId,
    details: 'User logged in'
  });
};

/**
 * Helper function to create audit logs for any entity
 * 
 * @param prisma - Prisma client instance
 * @param userId - ID of the user performing the action (optional)
 * @param action - Type of action being performed
 * @param entityType - Type of entity being acted upon
 * @param entityId - ID of the entity being acted upon
 * @param details - Additional details about the action (optional)
 */
export const auditEntityAction = async (
  prisma: any,
  userId: string | undefined,
  action: AuditAction,
  entityType: string,
  entityId: string,
  details?: string
) => {
  return createAuditLog(prisma, {
    userId,
    action,
    entityType,
    entityId,
    details
  });
};