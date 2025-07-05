import bcrypt from 'bcrypt';

// Number of salt rounds for bcrypt (12 as specified in guidelines)
const SALT_ROUNDS = 12;

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compare a password with a hash
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};