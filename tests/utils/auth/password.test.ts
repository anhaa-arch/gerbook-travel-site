import { hashPassword, comparePassword } from '../../../utils/auth/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      // Hashed password should be a string
      expect(typeof hashedPassword).toBe('string');
      
      // Hashed password should be different from the original password
      expect(hashedPassword).not.toBe(password);
      
      // Hashed password should be a bcrypt hash (starts with $2b$)
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });
    
    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hashedPassword1 = await hashPassword(password);
      const hashedPassword2 = await hashPassword(password);
      
      // Two hashes of the same password should be different due to salt
      expect(hashedPassword1).not.toBe(hashedPassword2);
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });
    
    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hashedPassword = await hashPassword(password);
      
      const result = await comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
});