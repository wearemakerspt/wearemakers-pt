import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSign, createCipheriv, randomBytes, createECDH } from 'crypto'

// ── Web Push encryption helpers (RFC 8291 / RFC 8292) ──────────────────────

function toBase64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64url(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

async function buildVapidToken(audience: string, subject: string, publicKey: string, privateKey: string): Promise<string> {
  const header = toBase64url(Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const now = Math.floor(Date.now() / 1000)
  const payload = toBase64url(Buffer.from(JSON.stringify({
    aud: audience,
    exp: now + 86400,
    sub: subject,
  })))
  const signingInput = `${header}.${payload}`
  const sign = createSign('SHA256')
  sign.update(signingInput)
  // Convert VAPID private key (base64url d) to PEM
  const privKeyDer = Buffer.concat([
    Buffer.from('308187020100301306072a8648ce3d020106082a8648ce3d030107046d306b0201010420', 'hex'),
    fromBase64url(privateKey),
    Buffer.from('a144034200', 'hex'),
    fromBase64url(publicKey),
  ])
  // Use raw ECDSA signing instead
  const sig = sign.sign({ key: privKeyDer, format: 'der', type: 'pkcs8', dsaEncoding: 'ieee-p1363' })
  return `${signingInput}.${toBase64url(sig)}`
}

async function encryptPayload(
  subscription: { endpoint: string; p256dh: string; auth: string },
  plaintext: string
): Promise<{ body: Buffer; salt: string; serverPublicKey: string }> {
  const { p256dh, auth } = subscription

  // Generate ephemeral ECDH key pair
  const ecdh = createECDH('prime256v1')
  ecdh.generateKeys()
  const serverPublicKey = ecdh.getPublicKey()
  const clientPublicKey = fromBase64url(p256dh)
  const authSecret = fromBase64url(auth)

  // Compute shared secret
  const sharedSecret = ecdh.computeSecret(clientPublicKey)

  // HKDF
  const { createHmac } = await import('crypto')

  function hkdf(salt: Buffer, ikm: Buffer, info: Buffer, len: number): Buffer {
    const prk = createHmac('sha256', salt).update(ikm).digest()
    const t = createHmac('sha256', prk).update(Buffer.concat([info, Buffer.from([1])])).digest()
    return t.slice(0, len)
  }

  const salt = randomBytes(16)

  // Context
  const context = Buffer.concat([
    Buffer.from('P-256\0'),
    Buffer.alloc(2), // client key length big-endian
    Buffer.from([(clientPublicKey.length >> 8) & 0xff, clientPublicKey.length & 0xff]),
    clientPublicKey,
    Buffer.from([(serverPublicKey.length >> 8) & 0xff, serverPublicKey.length & 0xff]),
    serverPublicKey,
  ])

  const prk = hkdf(authSecret, sharedSecret, Buffer.concat([Buffer.from('Content-Encoding: auth\0'), Buffer.alloc(1)]), 32)
  const cek = hkdf(salt, prk, Buffer.concat([Buffer.from('Content-Encoding: aesgcm\0'), context]), 16)
  const nonce = hkdf(salt, prk, Buffer.concat([Buffer.from('Content-Encoding: nonce\0'), context]), 12)

  // Encrypt
  const cipher = createCipheriv('aes-128-gcm', cek, nonce)
  const padding = Buffer.alloc(2) // 2 bytes of padding length
  const encrypted = Buffer.concat([cipher.update(Buffer.concat([padding, Buffer.from(plaintext)])), cipher.final(), cipher.getAuthTag()])

  return {
    body: encrypted,
    salt: toBase64url(salt),
    serverPublicKey: toBase64url(serverPublicKey),
  }
}

// ── Main route handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { makerId, marketName, brandName, brandSlug } = await req.json()

    if (!makerId || !marketName || !brandName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all visitors who saved this brand
    const { data: savedByVisitors } = await supabase
      .from('saved_brands')
      .select('visitor_id')
      .eq('brand_id', makerId)

    if (!savedByVisitors || savedByVisitors.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const visitorIds = savedByVisitors.map(r => r.visitor_id)

    // Get their push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('visitor_id', visitorIds)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearemakers.pt'
    const SUBJECT = `mailto:info@wearemakers.pt`

    const payload = JSON.stringify({
      title: `${brandName} is live`,
      body: `At ${marketName} right now. Go find them.`,
      url: brandSlug ? `/brands/${brandSlug}` : '/brands',
      icon: '/icon.svg',
    })

    let sent = 0
    const staleEndpoints: string[] = []

    for (const sub of subscriptions) {
      try {
        const audience = new URL(sub.endpoint).origin
        const vapidToken = await buildVapidToken(audience, SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
        const { body, salt, serverPublicKey } = await encryptPayload(sub, payload)

        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aesgcm',
            'Encryption': `salt=${salt}`,
            'Crypto-Key': `dh=${serverPublicKey};p256ecdsa=${VAPID_PUBLIC_KEY}`,
            'Authorization': `vapid t=${vapidToken},k=${VAPID_PUBLIC_KEY}`,
            'TTL': '86400',
          },
          body: new Uint8Array(body),
        })

        if (res.ok || res.status === 201) {
          sent++
        } else if (res.status === 410 || res.status === 404) {
          // Subscription expired — mark for cleanup
          staleEndpoints.push(sub.endpoint)
        }
      } catch {
        // silent — don't block check-in on push failure
      }
    }

    // Clean up expired subscriptions
    if (staleEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
    }

    return NextResponse.json({ sent, stale: staleEndpoints.length, total: subscriptions.length })
  } catch (err: any) {
    console.error('Push notification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
