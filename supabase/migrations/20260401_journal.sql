-- ============================================================
-- WEAREMAKERS.PT — Journal Migration
-- Run in Supabase SQL Editor after the main schema.
-- ============================================================

-- ── 1. JOURNAL ARTICLES TABLE ────────────────────────────────

CREATE TABLE journal_articles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  kicker           TEXT NOT NULL DEFAULT 'NEIGHBORHOOD LOOPS',
  dek              TEXT NOT NULL,           -- Sub-headline / standfirst
  lede             TEXT NOT NULL,           -- Opening paragraph (shown large)
  body_md          TEXT NOT NULL DEFAULT '', -- Full article in Markdown
  pull_quote       TEXT,
  author_name      TEXT NOT NULL DEFAULT 'WEAREMAKERS editorial team',

  -- SEO
  seo_title        TEXT,
  seo_description  TEXT,
  cover_image_url  TEXT,

  -- Maker links — array of profile slugs mentioned in the article
  -- Used to fetch the "Makers in this Loop" section
  featured_makers  TEXT[] NOT NULL DEFAULT '{}',

  -- Categorisation
  tags             TEXT[] NOT NULL DEFAULT '{}',

  -- Publishing
  is_published     BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_slug        ON journal_articles(slug);
CREATE INDEX idx_journal_published   ON journal_articles(published_at DESC)
  WHERE is_published = true;
CREATE INDEX idx_journal_makers      ON journal_articles USING GIN(featured_makers);
CREATE INDEX idx_journal_tags        ON journal_articles USING GIN(tags);

-- Auto-set published_at when an article is published
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND OLD.is_published = false THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_journal_publish
  BEFORE UPDATE ON journal_articles
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

CREATE TRIGGER trg_journal_updated
  BEFORE UPDATE ON journal_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE journal_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles (SEO-critical)
CREATE POLICY "journal_published_public"
  ON journal_articles FOR SELECT
  USING (is_published = true);

-- Admins can read and write everything
CREATE POLICY "journal_admin_all"
  ON journal_articles FOR ALL
  USING (current_role() = 'admin');

-- Curators can read unpublished articles (for preview)
CREATE POLICY "journal_curator_read"
  ON journal_articles FOR SELECT
  USING (current_role() IN ('curator', 'admin'));

-- ── 3. SEED — Three launch articles ──────────────────────────

INSERT INTO journal_articles (
  slug, title, kicker, dek, lede, body_md, pull_quote,
  author_name, featured_makers, tags, is_published, published_at
) VALUES

-- Article 1: Arroios
(
  'the-arroios-maker-loop',
  'The Arroios Maker Loop',
  'NEIGHBORHOOD LOOPS',
  'A walking route through the city''s most fertile creative neighbourhood — workshops, coffee, and three hidden gems you''ll only find by getting lost.',
  'Arroios is not yet on the tourist map. That will change. For now, it belongs to the makers — and to anyone willing to walk fifteen minutes east of the Intendente metro stop on a Saturday morning.',
  'The neighbourhood announces itself quietly. A hand-lettered sign in a first-floor window. The smell of fresh ink from a stairwell. A woman carrying a bolt of naturally dyed linen past a pastelaria that hasn''t changed its formica since 1978. This is Arroios: a working neighbourhood that is slowly, quietly becoming the most creative quarter in Lisbon.

The Loop begins at Largo do Intendente — the large square that anchors the WEAREMAKERS market every second Saturday. Arrive before eleven. The good coffee is at Café Royale on the north side of the square: dark roast only, marble counter, no Wi-Fi. The owners want you to look up from your screen. They are right.

From the square, follow Rua do Benformoso east for six minutes. You will pass two fabric shops that have been here since before you were born, a barbershop with no English spoken, and a tiny hardware store that stocks tools you thought were only available by mail order. Do not rush. The hardware store is worth ten minutes of your time.

## The First Maker Stop

TRAMA is the natural dye textile studio run by Ana and her two apprentices. The studio is not on any map. You will find it by the smell — woad and weld and something mineral you cannot name. Ana sells from a table outside on market Saturdays. Her textiles are not cheap. They are not meant to be: each piece takes three weeks from raw fleece to finished cloth.

OAKWALL is three minutes further east, tucked into a courtyard that looks closed. It is not closed. Push the gate. Pedro throws stoneware pots in a small kilned studio that smells of clay and woodsmoke. Every piece is, as he puts it, a scar from the kiln.',
  'The hardware store stocks tools you thought were only available by mail order.',
  'WEAREMAKERS editorial team',
  ARRAY['trama', 'oakwall', 'zona', 'ferro'],
  ARRAY['arroios', 'ceramics', 'textile', 'walking-guide'],
  true,
  NOW() - INTERVAL '3 days'
),

-- Article 2: LX Factory
(
  'the-lx-factory-sunday-ritual',
  'The LX Factory Sunday Ritual',
  'NEIGHBORHOOD LOOPS',
  'Every Sunday, a former industrial complex on the banks of the Tejo becomes the most concentrated kilometre of handmade things in Portugal.',
  'Under the 25 de Abril bridge, the city performs a weekly miracle: a ruined factory becomes the best argument for making things with your hands.',
  'LX Factory was a textile factory until the 1980s. Then it was abandoned. Then it was colonised by creatives, restaurateurs, bookshops and people who needed large, cheap, unheated spaces to make things. Now it runs markets every Sunday from ten until four.

The WEAREMAKERS presence at LX Factory is unofficial but permanent. A core of eight or nine makers shows up most weeks regardless of rain or cold — LIVRARIA with its art books, CORDA with its leather and rope, POLVORA with its letterpress prints. Around them, the market pulses with energy and the smell of grilled sardines from the restaurant terrace above.

## What to Look For

LIVRARIA prices its books by weight, not title. Bring a bag and a willingness to dig. You will find things here that have not been in print for thirty years.

CORDA makes bags using a single continuous cord, hand-stitched over a leather form. Watch the process if you can. It takes approximately forty minutes per bag and Miguel does it without looking down.

POLVORA runs a letterpress studio out of a converted printing room on the upper floor. Two for the price of one on Sundays. The ink smell alone is worth the trip.',
  'A ruined factory becomes the best argument for making things with your hands.',
  'WEAREMAKERS editorial team',
  ARRAY['livraria', 'corda', 'polvora', 'papel-co'],
  ARRAY['lx-factory', 'books', 'leather', 'letterpress', 'sunday'],
  true,
  NOW() - INTERVAL '17 days'
),

-- Article 3: Mouraria shadow markets
(
  'mouraria-at-dawn-shadow-markets',
  'Mouraria at Dawn: The Shadow Markets',
  'NEIGHBORHOOD LOOPS',
  'Before the city wakes up, a different kind of maker economy operates in the oldest neighbourhood in Lisbon. Early risers only.',
  'Set an alarm. Mouraria at 6am on a Saturday is a world that tourist Lisbon hasn''t discovered yet. That is the point.',
  'Shadow markets are unconfirmed, unofficial, sometimes technically illegal. They exist in the gap between the city''s bureaucracy and its creative energy. A maker needs a space. A space appears. The word spreads through WhatsApp, not through Instagram.

WEAREMAKERS tracks the shadow market circuit as a courtesy to its makers and visitors — not to legitimise it, but to help people find it. These are the markets labelled UNCONFIRMED in our system. They are real. They just don''t have permits yet.

## How to Find Them

Praça do Intendente is the unofficial anchor. Arrive before eight. The fruit sellers arrive first, then the textile stalls, then — if the week has gone well — two or three WEAREMAKERS makers who set up in the south corner near the fountain.

TERRACOTA is there most weeks. Maria sells small terracotta pots and hand-painted tiles from a folding table. She has been doing this since 2018 and has never been asked to move. She attributes this to arriving before the council inspectors and leaving before lunch.

Rua do Benformoso is where the circuit extends on good Saturdays. Six minutes east of Intendente. Follow the coffee smell.',
  'Shadow markets exist in the gap between the city''s bureaucracy and its creative energy.',
  'WEAREMAKERS editorial team',
  ARRAY['terracota', 'trama', 'zona', 'oakwall'],
  ARRAY['mouraria', 'shadow-markets', 'early-morning', 'terracotta'],
  true,
  NOW() - INTERVAL '31 days'
);

-- ── 4. VERIFY ────────────────────────────────────────────────
-- Run to confirm seed worked:
-- SELECT slug, title, is_published, published_at FROM journal_articles ORDER BY published_at DESC;
