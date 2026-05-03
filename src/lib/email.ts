// ── WEAREMAKERS.PT — Email Service (Resend) ───────────────────
// src/lib/email.ts

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'WEAREMAKERS.PT <info@wearemakers.pt>'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wearemakers.pt'

// ── Core send function ────────────────────────────────────────

async function sendEmail(to: string | string[], subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Resend error:', err)
      return false
    }

    return true
  } catch (e) {
    console.error('[email] Send failed:', e)
    return false
  }
}

// ── Shared email wrapper ──────────────────────────────────────

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #F4F1EC; font-family: 'Helvetica Neue', Arial, sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; background: #F4F1EC; }
  .header { background: #1A1A1A; padding: 24px 32px; border-bottom: 4px solid #E8001C; }
  .logo { font-size: 20px; font-weight: 900; letter-spacing: 0.04em; color: #F4F1EC; text-transform: uppercase; text-decoration: none; }
  .logo span { color: #E8001C; }
  .body { padding: 32px; border: 2px solid #1A1A1A; border-top: none; background: #F4F1EC; }
  .label { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #6B6560; margin-bottom: 6px; }
  h1 { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; text-transform: uppercase; color: #1A1A1A; line-height: 1; margin-bottom: 16px; }
  p { font-size: 14px; color: #6B6560; line-height: 1.65; margin-bottom: 16px; }
  .divider { height: 2px; background: rgba(12,12,12,0.1); margin: 24px 0; }
  .btn { display: inline-block; background: #E8001C; color: #F4F1EC; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; padding: 13px 24px; margin: 8px 0; }
  .btn-dark { background: #1A1A1A; }
  .badge { display: inline-block; background: #1a5c30; color: #F4F1EC; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 4px 10px; margin-bottom: 16px; }
  .badge-red { background: #E8001C; }
  .badge-grey { background: #6B6560; }
  .meta { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(12,12,12,0.4); }
  .footer { padding: 20px 32px; text-align: center; }
  .footer p { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(12,12,12,0.3); margin: 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <a href="${SITE}" class="logo">WEARE<span>MAKERS</span>.PT</a>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>WEAREMAKERS.PT · LISBON · <a href="${SITE}/circuit" style="color:rgba(12,12,12,0.3)">MANAGE PREFERENCES</a></p>
  </div>
</div>
</body>
</html>`
}

// ── 1. Market cancellation ────────────────────────────────────

export async function sendMarketCancelledEmails(
  recipients: string[],
  market: { title: string; event_date: string; space_name: string; id: string }
): Promise<void> {
  if (!recipients.length) return

  const date = new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase()

  const html = wrapEmail(`
    <div class="badge badge-grey">MARKET UPDATE</div>
    <h1>${market.title}<br/>CANCELLED</h1>
    <p>Unfortunately this market has been cancelled. We're sorry for any inconvenience.</p>
    <div class="divider"></div>
    <p class="meta">Market · ${market.title}</p>
    <p class="meta">Location · ${market.space_name}</p>
    <p class="meta">Date · ${date}</p>
    <div class="divider"></div>
    <p>Browse other upcoming markets in Lisbon:</p>
    <a href="${SITE}/markets" class="btn">VIEW MARKETS →</a>
  `)

  // Send in batches of 50 to respect rate limits
  const BATCH = 50
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    await Promise.all(batch.map(email =>
      sendEmail(email, `${market.title} — Cancelled`, html)
    ))
  }
}

// ── 2. Maker check-in alert ───────────────────────────────────

export async function sendCheckinAlertEmails(
  recipients: string[],
  maker: { display_name: string; slug: string | null; id: string },
  market: { space_name: string; title: string }
): Promise<void> {
  if (!recipients.length) return

  const brandUrl = `${SITE}/brands/${maker.slug ?? maker.id}`

  const html = wrapEmail(`
    <div class="badge">● LIVE NOW</div>
    <h1>${maker.display_name}<br/>IS AT THE MARKET</h1>
    <p><strong>${maker.display_name}</strong> just checked in at <strong>${market.space_name}</strong>. They're live right now.</p>
    <div class="divider"></div>
    <a href="${brandUrl}" class="btn">SEE THEIR STALL →</a>
    <a href="${SITE}/markets" class="btn btn-dark" style="margin-left:8px">VIEW ALL MARKETS →</a>
    <div class="divider"></div>
    <p class="meta">You're receiving this because you saved ${maker.display_name} to your Circuit.</p>
  `)

  const subject = `${maker.display_name} is live at ${market.space_name}`

  const BATCH = 50
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    await Promise.all(batch.map(email => sendEmail(email, subject, html)))
  }
}

// ── 3. Welcome email — maker ──────────────────────────────────

export async function sendWelcomeEmailMaker(
  to: string,
  name: string
): Promise<void> {
  const html = wrapEmail(`
    <div class="badge badge-red">APPLICATION RECEIVED</div>
    <h1>WELCOME,<br/>${name.toUpperCase()}</h1>
    <p>Your application to join WEAREMAKERS.PT has been received. Our team will review it and approve your brand within 24–48 hours.</p>
    <div class="divider"></div>
    <p class="meta">WHAT HAPPENS NEXT</p>
    <p>Once approved, you'll be able to check in to markets, share your digital offer with visitors, and appear in the live feed when you're at your stall.</p>
    <div class="divider"></div>
    <a href="${SITE}/auth/login" class="btn">ACCESS YOUR DASHBOARD →</a>
    <div class="divider"></div>
    <p class="meta">Questions? <a href="mailto:info@wearemakers.pt" style="color:#E8001C">info@wearemakers.pt</a></p>
  `)

  await sendEmail(to, 'Welcome to WEAREMAKERS.PT — Application Received', html)
}

// ── 4. Welcome email — curator ────────────────────────────────

export async function sendWelcomeEmailCurator(
  to: string,
  name: string
): Promise<void> {
  const html = wrapEmail(`
    <div class="badge badge-red">APPLICATION RECEIVED</div>
    <h1>WELCOME,<br/>${name.toUpperCase()}</h1>
    <p>Your curator application to WEAREMAKERS.PT has been received. Our team will review it and be in touch within 24–48 hours.</p>
    <div class="divider"></div>
    <p class="meta">WHAT HAPPENS NEXT</p>
    <p>Once approved, you'll be able to create and manage markets, build your maker line-up, and track who's attending your events.</p>
    <div class="divider"></div>
    <a href="${SITE}/auth/login" class="btn">ACCESS YOUR DASHBOARD →</a>
    <div class="divider"></div>
    <p class="meta">Questions? <a href="mailto:info@wearemakers.pt" style="color:#E8001C">info@wearemakers.pt</a></p>
  `)

  await sendEmail(to, 'Welcome to WEAREMAKERS.PT — Curator Application Received', html)
}

// ── 5. Maker approved ─────────────────────────────────────────

export async function sendApprovalEmail(
  to: string,
  name: string,
  role: 'maker' | 'curator'
): Promise<void> {
  const dashUrl = `${SITE}/dashboard/${role}`

  const html = wrapEmail(`
    <div class="badge">✓ APPROVED</div>
    <h1>YOU'RE IN,<br/>${name.toUpperCase()}</h1>
    <p>Your ${role} account has been approved. You can now access your dashboard and start using all features.</p>
    <div class="divider"></div>
    <a href="${dashUrl}" class="btn">GO TO YOUR DASHBOARD →</a>
  `)

  await sendEmail(to, `WEAREMAKERS.PT — Your account is approved`, html)
}
