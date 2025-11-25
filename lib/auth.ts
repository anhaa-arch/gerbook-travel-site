// Mock authentication utilities
export interface user {
  id: string
  name: string
  email: string
  role: "ADMIN" | "CUSTOMER" | "HERDER"
  avatar?: string
}

export const mockusers: Record<string, user> = {
  "admin@malchincamp.com": {
    id: "1",
    name: "Admin user",
    email: "admin@malchincamp.com",
    role: "ADMIN",
  },
  "herder@malchincamp.com": {
    id: "2",
    name: "Herder user",
    email: "herder@malchincamp.com",
    role: "HERDER",
  },
  "customer@malchincamp.com": {
    id: "3",
    name: "Customer user",
    email: "customer@malchincamp.com",
    role: "CUSTOMER",
  },
}

export async function authenticateuser(email: string, password: string): Promise<user> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockusers[email]
  if (user && password === "password123") {
    return user
  }

  throw new Error("Invalid credentials")
}

export function getStoreduser(): user | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeuser(user: user): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearStoreduser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}
