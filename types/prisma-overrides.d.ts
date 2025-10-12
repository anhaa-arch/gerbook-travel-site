// Module augmentation to relax Prisma User type for tests and mocks
declare module '@prisma/client' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User {
    // Allow arbitrary properties for test convenience
    [key: string]: any;
  }
}
