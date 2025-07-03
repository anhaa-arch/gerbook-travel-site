"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface SavedItem {
  id: string | number
  type: string // e.g. 'attraction', 'product', 'route', 'camp'
  data?: any
}

interface SavedContextType {
  savedItems: SavedItem[]
  isSaved: (id: string | number, type: string) => boolean
  toggleSave: (item: SavedItem) => void
  removeSaved: (id: string | number, type: string) => void
}

const SavedContext = createContext<SavedContextType | undefined>(undefined)

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("saved")
    if (stored) setSavedItems(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem("saved", JSON.stringify(savedItems))
  }, [savedItems])

  const isSaved = (id: string | number, type: string) =>
    savedItems.some((item) => item.id === id && item.type === type)

  const toggleSave = (item: SavedItem) => {
    setSavedItems((prev) => {
      if (isSaved(item.id, item.type)) {
        return prev.filter((i) => !(i.id === item.id && i.type === item.type))
      }
      return [...prev, item]
    })
  }

  const removeSaved = (id: string | number, type: string) => {
    setSavedItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)))
  }

  return (
    <SavedContext.Provider value={{ savedItems, isSaved, toggleSave, removeSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error("useSaved must be used within a SavedProvider")
  return ctx
} 