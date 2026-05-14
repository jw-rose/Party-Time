'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function InviteSessionRefresh() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const session = await authClient.getSession()

      if (mounted && session?.data?.session) {
        router.refresh()
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [router])

  return null
}