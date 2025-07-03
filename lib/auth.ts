// Mock authentication utilities
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "herder"
  avatar?: string
}

export const mockUsers: Record<string, User> = {
  "admin@malchincamp.com": {
    id: "1",
    name: "Admin User",
    email: "admin@malchincamp.com",
    role: "admin",
  },
  "herder@malchincamp.com": {
    id: "2",
    name: "Herder User",
    email: "herder@malchincamp.com",
    role: "herder",
  },
  "user@malchincamp.com": {
    id: "3",
    name: "Regular User",
    email: "user@malchincamp.com",
    role: "user",
  },
}

export async function authenticateUser(email: string, password: string): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers[email]
  if (user && password === "password123") {
    return user
  }

  throw new Error("Invalid credentials")
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}
