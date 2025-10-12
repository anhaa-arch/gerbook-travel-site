import express from 'express'
import fetch from 'node-fetch'
import prisma from '../prisma/client'
import { generateToken } from '../utils/auth/jwt'
import { hashPassword } from '../utils/auth/password'
import { validateInput } from '../utils/validation'

const router = express.Router()

// Callback endpoint for Google OAuth
router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string
  const state = req.query.state as string | undefined

  if (!code) return res.status(400).send('Missing code')

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'))}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      } as any)
    })

    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token) {
      console.error('Google token error', tokenJson)
      return res.status(500).send('Failed to exchange code for token')
    }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    })
    const profile = await profileRes.json()

    // Validate basic profile
    const email = profile.email as string
    const name = profile.name as string || profile.email || 'GoogleUser'

    if (!email) return res.status(400).send('Email not available from Google')

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // create a non-password user with random password
      const randomPass = Math.random().toString(36).slice(2)
      const hashed = await hashPassword(randomPass)
      user = await prisma.user.create({ data: { email, name, password: hashed } })
    }

    // Generate JWT
    const jwtToken = generateToken(user as any)

    // Redirect to frontend with token as query (frontend should handle saving token securely)
    const redirectTo = (process.env.FRONTEND_URL || 'http://localhost:3000') + `/oauth-callback?token=${encodeURIComponent(jwtToken)}`
    return res.redirect(302, redirectTo)
  } catch (err) {
    console.error('Google OAuth callback error', err)
    return res.status(500).send('OAuth error')
  }
})

export default router
