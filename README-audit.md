# User Activity Audit System

This document describes the implementation of an audit system to record user activities in the application.

## Overview

The audit system tracks various user activities such as:
- User registration
- User login
- User profile updates
- User deletion
- User profile retrieval
- User listing

## Implementation Details

### 1. Database Schema

A new `Audit` model has been added to the Prisma schema to store audit logs:

```prisma
// Audit model for tracking user activities
model Audit {
  id          String      @id @default(uuid())
  userId      String?     // Optional: action might not be associated with a user
  action      AuditAction
  entityType  String      // The type of entity (User, Booking, Product, etc.)
  entityId    String      // The ID of the entity
  details     String?     @db.Text // Additional details about the action
  createdAt   DateTime    @default(now())
  
  // Optional relation to User if userId is provided
  user        User?       @relation(fields: [userId], references: [id])
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  OTHER
}
```

The `User` model has been updated to include a relation to audit logs:

```prisma
model User {
  // ... existing fields
  auditLogs     Audit[]   // Relation to audit logs
}
```

### 2. Utility Functions

Utility functions for audit logging have been created in `utils/audit/index.ts`:

- `createAuditLog`: Core function to create an audit log entry
- `auditUserAction`: Helper for user-related actions
- `auditUserLogin`: Specific helper for login events
- `auditEntityAction`: Generic helper for any entity type

### 3. Resolver Integration

All user resolvers have been updated to include audit logging:

#### Mutations:
- `register`: Logs user creation
- `login`: Logs user login
- `updateUser`: Logs user updates
- `deleteUser`: Logs user deletion

#### Queries:
- `me`: Logs user profile retrieval
- `users`: Logs user listing (admin only)
- `user`: Logs specific user retrieval (admin only)
- `allUsers`: Logs all users retrieval

## Deployment Instructions

To apply the schema changes to the database, run the following command:

### For Development Environment:
```bash
npx prisma migrate dev
```

### For Docker Environment:
```bash
docker-compose exec app npx prisma migrate deploy
```

## Usage Examples

### Querying Audit Logs

You can query audit logs using Prisma Client:

```typescript
// Get all audit logs
const allAuditLogs = await prisma.audit.findMany();

// Get audit logs for a specific user
const userAuditLogs = await prisma.audit.findMany({
  where: { userId: 'user-id-here' }
});

// Get audit logs for a specific action type
const loginAuditLogs = await prisma.audit.findMany({
  where: { action: 'LOGIN' }
});
```

## Future Enhancements

1. Add GraphQL queries and mutations for audit logs (admin only)
2. Implement audit log retention policies
3. Add more detailed information to audit logs
4. Extend audit logging to other entities (Bookings, Products, etc.)