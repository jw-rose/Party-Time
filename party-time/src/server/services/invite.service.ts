export function generateInviteToken(): string {
  return crypto.randomUUID()
}

export function generateExpiryDate(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 48)
  return expiry
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function isTokenUsed(usedAt: Date | null): boolean {
  return usedAt !== null
}

export function buildInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}