"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface User {
  id: string
  emailAddresses: { emailAddress: string }[]
  username: string | null
  firstName: string | null
  imageUrl: string
}

interface AuthContextType {
  userId: string | null
  user: User | null
  isLoaded: boolean
  isSignedIn: boolean
  signIn: (email: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUserId = localStorage.getItem("dscd_user_id")
    const storedUser = localStorage.getItem("dscd_user")
    if (storedUserId && storedUser) {
      setUserId(storedUserId)
      setUser(JSON.parse(storedUser))
    }
    setIsLoaded(true)
  }, [])

  const signIn = useCallback((email: string) => {
    const newUserId = `user_${Date.now()}`
    const newUser: User = {
      id: newUserId,
      emailAddresses: [{ emailAddress: email }],
      username: email.split("@")[0],
      firstName: email.split("@")[0],
      imageUrl: "",
    }
    setUserId(newUserId)
    setUser(newUser)
    localStorage.setItem("dscd_user_id", newUserId)
    localStorage.setItem("dscd_user", JSON.stringify(newUser))
  }, [])

  const signOut = useCallback(() => {
    setUserId(null)
    setUser(null)
    localStorage.removeItem("dscd_user_id")
    localStorage.removeItem("dscd_user")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        isLoaded,
        isSignedIn: !!userId,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Return default values if outside provider (for SSR)
    return { userId: null, isLoaded: false, isSignedIn: false }
  }
  return {
    userId: context.userId,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
  }
}

export function useUser() {
  const context = useContext(AuthContext)
  if (!context) {
    return { user: null, isLoaded: false }
  }
  return {
    user: context.user,
    isLoaded: context.isLoaded,
  }
}

export function useAuthActions() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthActions must be used within an AuthProvider")
  }
  return {
    signIn: context.signIn,
    signOut: context.signOut,
  }
}

// Components that mimic Clerk's SignedIn, SignedOut, UserButton
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded || !isSignedIn) return null
  return <>{children}</>
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  if (!isLoaded || isSignedIn) return null
  return <>{children}</>
}
