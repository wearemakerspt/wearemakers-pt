'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { anonGet, anonClear, ANON_KEYS, type AnonBrand, type AnonGem, type AnonMarket } from '@/lib/anonCircuit'
import { Suspense } from 'react'

function SyncContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'
  const [status, setStatus] = useState('Syncing your Circuit...')

  useEffect(() => {
    async function sync() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.replace(next)
          return
        }

        const brands = anonGet<AnonBrand>(ANON_KEYS.brands)
        const gems = anonGet<AnonGem>(ANON_KEYS.gems)
        const markets = anonGet<AnonMarket>(ANON_KEYS.markets)

        const total = brands.length + gems.length + markets.length

        if (total === 0) {
          router.replace(next)
          return
        }

        setStatus(`Syncing ${total} saved item${total !== 1 ? 's' : ''}...`)

        // Sync saved brands
        if (brands.length > 0) {
          await supabase.from('saved_brands').upsert(
            brands.map(b => ({ visitor_id: user.id, brand_id: b.id })),
            { onConflict: 'visitor_id,brand_id', ignoreDuplicates: true }
          )
        }

        // Sync saved gems
        if (gems.length > 0) {
          await supabase.from('saved_gems').upsert(
            gems.map(g => ({ visitor_id: user.id, gem_id: g.id })),
            { onConflict: 'visitor_id,gem_id', ignoreDuplicates: true }
          )
        }

        // Sync saved markets
        if (markets.length > 0) {
          await supabase.from('saved_markets').upsert(
            markets.map(m => ({ visitor_id: user.id, market_id: m.id })),
            { onConflict: 'visitor_id,market_id', ignoreDuplicates: true }
          )
        }

        // Clear localStorage after successful sync
        anonClear()

        setStatus('Circuit synced ✓')
      } catch (e) {
        console.error('Sync error:', e)
        // Never block registration on sync failure — just proceed
      }

      router.replace(next)
    }

    sync()
  }, [next, router])

  return (
    <main style={{ background: '#1A1A1A', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: '#F4F1EC', marginBottom: '12px' }}>
          WEAREMAKERS<span style={{ color: '#E8001C' }}>.PT</span>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.4)' }}>
          {status}
        </div>
      </div>
    </main>
  )
}

export default function SyncPage() {
  return (
    <Suspense fallback={
      <main style={{ background: '#1A1A1A', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.4)' }}>
          LOADING...
        </div>
      </main>
    }>
      <SyncContent />
    </Suspense>
  )
}
