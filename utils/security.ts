import crypto from 'crypto'

// Generate a cryptographically secure random token (hex)
export const generateSecureToken = (size = 32): string => {
  return crypto.randomBytes(size).toString('hex')
}

// Hash token using SHA-256 (hex)
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Generate a short numeric OTP with given length (default 6)
export const generateNumericOtp = (length = 6): string => {
  const max = 10 ** length
  const num = crypto.randomInt(Math.floor(max / 10), max)
  return num.toString().padStart(length, '0')
}

export default {
  generateSecureToken,
  hashToken,
  generateNumericOtp,
}
