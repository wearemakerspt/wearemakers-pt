'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const SKIP_ROUTES = ['/auth', '/dashboard', '/pitch', '/espacos', '/welcome']

export default function SplashScreen() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const skip = SKIP_ROUTES.some(r => pathname.startsWith(r))
    if (skip) return
    if (typeof window === 'undefined') return

    const welcomed = localStorage.getItem('wam_welcomed')
    if (!welcomed) {
      router.replace('/welcome')
    }
  }, [pathname, router])

  // This component renders nothing — it just redirects
  return null
}
