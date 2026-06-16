import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a number as a percentage string. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

/** Truncates a string to a max length with ellipsis. */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/** Returns a score colour class based on value (0–100). */
export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

/** Returns a badge variant name based on score. */
export function scoreBadge(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default'
  if (score >= 50) return 'secondary'
  return 'destructive'
}

/** Counts words in a string. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Persist a value to localStorage with a namespace key. */
export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`rr:${key}`, JSON.stringify(value))
  } catch {
    // Ignore storage quota errors gracefully
  }
}

/** Retrieve a typed value from localStorage. */
export function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`rr:${key}`)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Remove a value from localStorage. */
export function lsRemove(key: string): void {
  localStorage.removeItem(`rr:${key}`)
}
