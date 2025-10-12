// Simple SMS provider interface and development stub
// In production, replace the sendSms implementation with a real provider (Twilio, MSG91, etc.)

export interface SmsProvider {
  sendSms: (phone: string, message: string) => Promise<boolean>
}

// Development stub - logs the message and returns true
export const devSmsProvider: SmsProvider = {
  sendSms: async (phone: string, message: string) => {
    console.log(`[devSmsProvider] Sending SMS to ${phone}: ${message}`)
    return true
  }
}

// Twilio provider (lazy-loaded to avoid requiring Twilio in dev)
export const twilioProvider = (accountSid: string, authToken: string, fromNumber: string): SmsProvider => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio')(accountSid, authToken)
  return {
    sendSms: async (phone: string, message: string) => {
      try {
        await twilio.messages.create({ body: message, from: fromNumber, to: phone })
        return true
      } catch (err) {
        console.error('Twilio send error', err)
        return false
      }
    }
  }
}

// Helper to select provider based on environment
const provider: SmsProvider = (() => {
  if (process.env.SMS_PROVIDER === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    const authToken = process.env.TWILIO_AUTH_TOKEN || ''
    const fromNumber = process.env.TWILIO_FROM_NUMBER || ''
    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio configured but missing credentials. Falling back to devSmsProvider')
      return devSmsProvider
    }
    return twilioProvider(accountSid, authToken, fromNumber)
  }
  return devSmsProvider
})()

export const generateOtp = (): string => {
  // simple 6-digit OTP; for stronger numeric generation, use crypto in utils/security
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default provider
