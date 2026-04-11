'use client'
import Link from 'next/link'

type CuratorCard = {
  curator_id: string
  pinned_at: string
  curator: {
    display_name: string
    slug: string
    avatar_url: string | null
  }
}

type Props = {
  curatorCards: CuratorCard[]
}

export default function SpotlightCarousel({ curatorCards }: Props) {
  return (
    <section style={{
      borderTop: '3px solid var(--INK)',
      borderBottom: '3px solid var(--INK)',
      paddingTop: '14px',
      paddingBottom: '14px',
      marginTop: '0',
    }}>
      {/* Section label */}
      <div style={{
        fontFamily: 'var(--TAG)',
        fontSize: '10px',
        letterSpacing: '0.22em',
        color: 'var(--INK)',
        opacity: 0.38,
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        SPOTLIGHT
      </div>

      {/* Scrollable strip */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>

        {/* WAM TOP 20 — always slot 1 */}
        <Link href="/brands/wam-top20" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '140px',
              height: '190px',
              border: '3px solid var(--RED)',
              background: 'var(--RED)',
              color: 'var(--P)',
              padding: '12px 10px',
              boxShadow: '4px 4px 0 0 var(--INK)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{
                fontFamily: 'var(--TAG)',
                fontSize: '9px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: '8px',
              }}>
                EDITORIAL
              </div>
              <div style={{
                fontFamily: 'var(--LOGO)',
                fontSize: '2rem',
                fontWeight: 900,
                lineHeight: 0.92,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
              }}>
                WAM<br />TOP<br />20
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--TAG)',
              fontSize: '9px',
              letterSpacing: '0.1em',
              opacity: 0.75,
              textTransform: 'uppercase',
            }}>
              20 MAKERS →
            </div>
          </div>
        </Link>

        {/* Curator spotlight cards */}
        {curatorCards.map((card) => (
          <Link
            key={card.curator_id}
            href={`/brands/spotlight/${card.curator.slug}`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <div
              style={{
                width: '140px',
                height: '190px',
                border: '3px solid var(--INK)',
                background: 'var(--P2)',
                padding: '12px 10px',
                boxShadow: '4px 4px 0 0 var(--INK)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {card.curator.avatar_url ? (
                  <img
                    src={card.curator.avatar_url}
                    alt={card.curator.display_name}
                    style={{
                      width: '36px',
                      height: '36px',
                      objectFit: 'cover',
                      border: '2px solid var(--INK)',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    border: '2px solid var(--INK)',
                    background: 'var(--P3)',
                    marginBottom: '10px',
                  }} />
                )}
                <div style={{
                  fontFamily: 'var(--TAG)',
                  fontSize: '9px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--INK)',
                  opacity: 0.38,
                  marginBottom: '5px',
                }}>
                  CURATOR
                </div>
                <div style={{
                  fontFamily: 'var(--LOGO)',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  lineHeight: 1.0,
                  textTransform: 'uppercase',
                  color: 'var(--INK)',
                  letterSpacing: '-0.01em',
                }}>
                  {card.curator.display_name}
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--TAG)',
                fontSize: '9px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--INK)',
                opacity: 0.38,
              }}>
                PICKS →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
