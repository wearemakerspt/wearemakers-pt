'use client'
import { useState } from 'react'
import Link from 'next/link'

type Lang = 'pt' | 'en'

const T = {
  pt: {
    navHow: 'Como Funciona', navFor: 'Para Quem É', navFeat: 'Plataforma', navCta: 'ADERIR AGORA →',
    heroKicker: 'LISBOA · WE ARE MAKERS · MERCADOS ABERTOS HOJE',
    heroH1: ['A VERDADEIRA', 'LISBOA NÃO', 'ESTÁ ', 'ATRÁS', 'DE VIDROS.'],
    heroH1em: [false, false, false, true, true],
    heroBody: 'Todos os dias, nos mercados de rua de Lisboa, criadores independentes, artesãos e marcas locais montam as suas bancas. Mas os visitantes passam sem os ver — e quando os encontram uma vez, não os conseguem encontrar outra vez.',
    heroBodyBold: 'criadores independentes, artesãos e marcas locais',
    heroBody2: 'A WEAREMAKERS.PT fecha esse ciclo. Em tempo real, hoje, ali ao fundo.',
    heroCta1: 'ADERIR AGORA →', heroCta2: 'VER COMO FUNCIONA ↓',
    heroSub: 'Criadores · Curadores · Sempre Gratuito · Sem Comissão',
    stat1n: '200+', stat1l: 'Marcas de criadores independentes',
    stat2n: '6M', stat2l: 'Turistas visitam Lisboa por ano',
    stat3n: '6', stat3l: 'Idiomas — PT · EN · ES · DE · FR · IT',
    stat4n: '0€', stat4l: 'Custo para aderir. Sempre gratuito.',
    probEyebrow: 'O PROBLEMA',
    probQ: ['OS VISITANTES', 'PASSAM E NÃO', 'SABEM QUE', 'ESTAMOS', 'AQUI.'],
    probQem: [false, false, false, false, true],
    probTitle: 'As lojas de lembranças são visíveis. Os criadores reais não são.',
    probBody: 'Lisboa tem dezenas de mercados de rua activos ao longo da semana. Criadores independentes operam pela cidade todos os dias — mas não existe um único sítio para os visitantes descobrirem quem está onde, agora mesmo.',
    probBody2: 'Os criadores estão lá — mas os visitantes não sabem. Os curadores organizam os mercados sem ferramentas digitais. Esse ciclo está quebrado. Nós corrigimo-lo.',
    probCallout: '"Os visitantes passam e não sabem que estamos aqui. E se nos encontram uma vez, não nos conseguem encontrar outra vez na semana a seguir."',
    audEyebrow: 'PARA QUEM É',
    audTitle: ['DOIS', 'PAPÉIS.', 'UMA CIDADE.'],
    audSub: 'A WEAREMAKERS.PT foi construída para dois papéis — criadores independentes e curadores de mercado. Cada um tem o seu portal, ferramentas e objectivos. Uma plataforma liga os dois.',
    a1i: '01 · CRIADORES & MARCAS', a1t: ['SER', 'ENCONTRADO.', 'EM DIRECTO.'],
    a1b: 'Marcas independentes e artesãos que vendem nos mercados de Lisboa. Faz check-in, atrai visitantes, capta emails, constrói uma audiência que regressa — em qualquer mercado, qualquer dia.',
    a1f: ['Check-in com um toque em qualquer mercado, qualquer dia', 'Perfil de marca — galeria, tags, preços, Instagram', 'Captura de email quando visitantes guardam a tua marca', 'Sistema de ofertas — códigos promo usados na banca', 'Calendário de mercado — publica as tuas datas', 'Análises — visualizações, guardados, taps IG por mercado'],
    a1cta: 'REGISTAR A TUA MARCA →',
    a2i: '02 · CURADORES DE MERCADO', a2t: ['GERE O', 'SEU', 'MERCADO.'],
    a2b: 'Organizadores de mercado que querem uma presença digital real. Vários curadores podem operar na mesma localização em dias diferentes. Cura, publica, promove — em minutos, não horas.',
    a2f: ['Perfil de curador — a casa digital permanente do seu mercado', 'Cura as suas top 10 marcas para o carrossel da homepage', 'Publica datas de mercado — gira o seu próprio calendário', 'Kit Promo — copie todos os handles em directo com um toque', 'Dashboard — visitantes, guardados, actividade de marcas', 'Alcance em 6 idiomas, automaticamente'],
    a2cta: 'REGISTAR O SEU MERCADO →',
    howEyebrow: 'COMO FUNCIONA',
    howTitle: ['TRÊS', 'PASSOS.', 'UMA', 'PLATAFORMA.'],
    howSub: 'Uma camada em tempo real que liga cada criador, cada mercado e cada visitante na cidade.',
    s1e: 'CRIADOR', s1t: 'CHECK-IN', s1b: 'O criador chega à banca e faz check-in com um toque. A marca fica imediatamente visível na plataforma. Badge verde no perfil. Contador em directo na página do mercado.',
    s2e: 'VISITANTE', s2t: 'DESCOBRIR', s2b: 'O visitante abre a WEAREMAKERS.PT e vê quem está em directo hoje. Filtra por categoria, guarda marcas, recebe notificações. A verdadeira Lisboa, não a versão turística.',
    s3e: 'CURADOR', s3t: 'PUBLICAR', s3b: 'O curador publica as datas do mercado e gere o calendário. Os criadores fazem check-in quando chegam. Juntos, constroem um mercado com visibilidade digital real.',
    loopEyebrow: 'O CICLO DO PRODUTO',
    loopTitle: ['DESCOBRIR.', 'GUARDAR.', 'REGRESSAR.'],
    loopSub: 'O mercado é o primeiro contacto. A WEAREMAKERS.PT torna-o permanente.',
    ls1t: 'DESCOBRIR', ls1b: 'O visitante encontra a WEAREMAKERS.PT — antes, durante ou após visitar um mercado. Vê quem está em directo hoje, explora perfis de marcas, descobre o que está perto.',
    ls2t: 'GUARDAR', ls2b: 'Encontra o Oakwall. Toca no coração e deixa o email. A marca fica guardada. Se houver uma oferta activa, é apresentada automaticamente — mostrada na banca.',
    ls3t: 'NOTIFICAR', ls3b: 'O Oakwall faz check-in num mercado. O visitante recebe uma notificação push: "Oakwall está em directo no Príncipe Real hoje."',
    ls4t: 'REGRESSAR', ls4b: 'O visitante volta. O ciclo fecha. Um encontro único no mercado torna-se uma relação contínua entre um criador e a sua audiência.',
    featEyebrow: 'FUNCIONALIDADES DA PLATAFORMA',
    featTitle: ['REAL.', 'EM DIRECTO.', 'AGORA.'],
    featSub: 'Tudo o que a plataforma faz — para criadores independentes e curadores de mercado — construído num único sistema em tempo real.',
    f1tag: 'TEMPO REAL', f1t: 'CHECK-INS EM DIRECTO', f1b: 'Os criadores ficam em directo com um toque — em qualquer mercado, qualquer dia. Badge verde no cartão. Contador em directo. Actualização automática de 60 em 60 segundos.',
    f2tag: 'VISITANTE', f2t: 'PLANO PESSOAL', f2b: 'Construtor de itinerário pessoal. Slots de manhã, tarde e noite. Os mercados abertos formam a base. Badge vermelho no nav mostra quantas paragens foram adicionadas.',
    f3tag: 'PWA', f3t: 'NOTIFICAÇÕES PUSH', f3b: 'Guarda uma marca. Recebe notificação quando ficarem em directo — em qualquer mercado, qualquer dia. Instalável no ecrã inicial. Sem loja de apps.',
    f4tag: 'CRIADOR', f4t: 'SISTEMA DE OFERTAS', f4b: 'Os criadores activam uma oferta com um código promo único. Guardar uma marca com oferta activa apresenta automaticamente o modal. Mostrado na banca como um carimbo digital.',
    f5tag: 'CURADOR', f5t: 'KIT PROMO', f5b: 'Um toque copia todos os handles de marcas com check-in numa legenda pronta a colar para os Instagram Stories. Construído para o workflow real de um organizador de mercado.',
    f6tag: 'MULTILÍNGUE', f6t: '6 IDIOMAS', f6b: 'Cada bio de marca escrita em português é automaticamente apresentada em EN, ES, DE, FR e IT. Os visitantes vêem o conteúdo na sua língua. A tradução é invisível.',
    spLabelL: 'Para criadores independentes',
    spTitleL: ['SER', 'ENCONTRADO.', 'EM DIRECTO.', 'CRESCER.'],
    spBodyL: 'Já fazes a parte difícil — aparecer. A WEAREMAKERS.PT trata do resto. Fica visível antes dos visitantes chegarem. Constrói uma audiência que regressa para te encontrar em qualquer mercado, qualquer dia.',
    spListL: ['Perfil de marca com fotos, tags, preços e link Instagram', 'Check-in com um toque — fica em directo em qualquer mercado', 'Check-in em múltiplos mercados ao mesmo tempo', 'Captura de email de visitantes quando guardam a tua marca', 'Sistema de ofertas — códigos promo usados na banca', 'Análises — visualizações, guardados, taps IG por mercado', 'Calendário de mercado — publica as tuas datas futuras'],
    spCtaL: 'REGISTAR A TUA MARCA →', spFreeL: 'Sempre gratuito · Sem comissão · Só alcance',
    spLabelM: 'Para curadores de mercado',
    spTitleM: ['GERE O', 'SEU MERCADO.', 'DIGITALMENTE.'],
    spBodyM: 'Gere o mercado. A WEAREMAKERS.PT trata da presença digital. Cura a sua selecção, publique as suas datas, alcance milhares de visitantes automaticamente.',
    spListM: ['Perfil de curador — a casa digital permanente do seu mercado', 'Cura as suas top 10 marcas — aparece no carrossel da homepage', 'Publica datas de mercado — gira o seu próprio calendário', 'Kit Promo — copie todos os handles em directo com um toque para Stories', 'Seleccionador de marcas — escolha quais representam o seu mercado', 'Alcance em 6 idiomas, automaticamente', 'Dashboard — visitantes, guardados, actividade de marcas'],
    spCtaM: 'REGISTAR O SEU MERCADO →', spFreeM: 'Demora 10 minutos a configurar · Gratuito para aderir',
    faqEyebrow: 'PERGUNTAS', faqTitle: ['PERGUNTAS', '& RESPOSTAS.'],
    faqTabM: 'Criadores', faqTabC: 'Curadores',
    fqM: [
      { q: 'A WEAREMAKERS.PT É MESMO GRATUITA?', a: 'Sim, completamente. Registar a tua marca, fazer check-in, receber emails de visitantes, aparecer nas páginas de mercado — tudo gratuito. Não cobramos comissão nas vendas.' },
      { q: 'COMO FUNCIONA O CHECK-IN?', a: 'Abre o Portal do Criador, selecciona o mercado e activa o toggle. A tua marca passa imediatamente para a secção "Em directo no mercado". Podes fazer check-in em múltiplos mercados ao mesmo tempo.' },
      { q: 'E OS EMAILS DOS VISITANTES?', a: 'Quando um visitante guarda a tua marca, é convidado a deixar o email para receber notificações. Esses contactos são teus — aparecem no teu painel e podem ser exportados em CSV.' },
      { q: 'PRECISO DE UM SITE PARA ADERIR?', a: 'Não. O teu perfil WEAREMAKERS.PT torna-se a tua presença online. Se tiveres um site, adicionamos um botão "Comprar Online" que envia tráfego directamente para a tua loja.' },
    ],
    fqC: [
      { q: 'COMO ME REGISTO COMO CURADOR?', a: 'Regista-te no portal como Curador. A nossa equipa abre as datas do seu mercado e atribui-o como curador oficial. Vários curadores podem gerir a mesma localização em dias diferentes.' },
      { q: 'POSSO GERIR VÁRIOS MERCADOS?', a: 'Sim. Cada curador pode ter múltiplos mercados associados ao seu perfil. Podes organizar o LX Factory aos sábados e o Príncipe Real às quintas — tudo na mesma conta.' },
      { q: 'COMO FUNCIONA O KIT PROMO?', a: 'Com um toque, copiamos todos os handles do Instagram das marcas com check-in activo numa legenda formatada para Instagram Stories. Cola directamente — nomes, emojis, hashtags.' },
      { q: 'OS MEUS MERCADOS APARECEM EM QUE IDIOMAS?', a: 'Os vossos mercados e as bios das marcas são automaticamente apresentados em 6 idiomas — PT, EN, ES, DE, FR e IT. O curador gere tudo em português.' },
    ],
    ftaEyebrow: 'LISBOA · WE ARE MAKERS · AO VIVO HOJE',
    ftaTitle: ['JUNTE-SE', 'AO MOVIMENTO.'],
    ftaTitleEm: [false, true],
    fctaPrimary: 'ADERIR COMO CRIADOR →', fctaSecondary: 'REGISTAR O MEU MERCADO →',
    fctaSub: 'Gratuito para criadores · Gratuito para curadores · Sem comissão',
  },
  en: {
    navHow: 'How It Works', navFor: 'Who Is It For', navFeat: 'Platform', navCta: 'JOIN NOW →',
    heroKicker: 'LISBON · WE ARE MAKERS · MARKETS OPEN TODAY',
    heroH1: ['THE REAL', 'LISBON', "ISN'T ", 'BEHIND', 'GLASS.'],
    heroH1em: [false, false, false, true, true],
    heroBody: "Every day at Lisbon's street markets, independent makers, artisans and local brands set up their stalls. Visitors walk past without seeing them — and when they find a brand once, they can't find them again the following week.",
    heroBodyBold: 'independent makers, artisans and local brands',
    heroBody2: 'WEAREMAKERS.PT closes that loop. In real time. Today. Around the corner.',
    heroCta1: 'JOIN NOW →', heroCta2: 'SEE HOW IT WORKS ↓',
    heroSub: 'Makers · Curators · Always Free · Zero Commission',
    stat1n: '200+', stat1l: 'Independent maker brands',
    stat2n: '6M', stat2l: 'Tourists visit Lisbon per year',
    stat3n: '6', stat3l: 'Languages — PT · EN · ES · DE · FR · IT',
    stat4n: '0€', stat4l: 'Cost to join. Always free.',
    probEyebrow: 'THE PROBLEM',
    probQ: ['VISITORS WALK', 'PAST AND', "DON'T KNOW", "WE'RE", 'HERE.'],
    probQem: [false, false, false, false, true],
    probTitle: 'Souvenir shops have storefronts. Independent makers disappear every evening.',
    probBody: "Lisbon has dozens of active street markets every week. Independent makers operate across the city every day — but there is no single place for visitors to discover who is where, right now.",
    probBody2: "The makers are there — but visitors don't know. Curators organise markets without digital tools. The loop is broken. We fix it.",
    probCallout: '"Visitors walk past and don\'t know we\'re here. And if they find us once, they can\'t find us again the following week."',
    audEyebrow: 'WHO IS IT FOR',
    audTitle: ['TWO', 'ROLES.', 'ONE CITY.'],
    audSub: 'WEAREMAKERS.PT is built for two roles — independent makers and market curators. Each has their own portal, tools and goals. One platform connects both.',
    a1i: '01 · MAKERS & BRANDS', a1t: ['BE', 'FOUND.', 'LIVE.'],
    a1b: 'Independent makers and artisans selling at Lisbon street markets. Check in, attract visitors, capture emails, build a returning audience — at any market, any day.',
    a1f: ['One-tap check-in at any market, any day', 'Brand profile — gallery, tags, price range, Instagram', 'Email capture when visitors save your brand', 'Offer system — promo codes used at the stall', 'Market calendar — publish your upcoming dates', 'Analytics — views, saves, IG taps per market'],
    a1cta: 'REGISTER YOUR BRAND →',
    a2i: '02 · MARKET CURATORS', a2t: ['MANAGE', 'YOUR', 'MARKET.'],
    a2b: 'Market organisers who want a real digital presence. Multiple curators can operate the same location on different days. Curate, publish, promote — in minutes, not hours.',
    a2f: ['Curator profile — your market\'s permanent digital home', 'Curate your top brands for the homepage carousel', 'Publish market dates — manage your own calendar', 'Promo Kit — copy all live handles with one tap', 'Dashboard — visitors, saves, brand activity', 'Visitor reach in 6 languages, automatically'],
    a2cta: 'REGISTER YOUR MARKET →',
    howEyebrow: 'HOW IT WORKS',
    howTitle: ['THREE', 'STEPS.', 'ONE', 'PLATFORM.'],
    howSub: 'A real-time layer connecting every maker, every market and every visitor in the city.',
    s1e: 'MAKER', s1t: 'CHECK IN', s1b: 'The maker arrives at their stall and checks in with one tap. The brand is instantly visible on the platform. Green badge on the profile. Live counter on the market page.',
    s2e: 'VISITOR', s2t: 'DISCOVER', s2b: 'The visitor opens WEAREMAKERS.PT and sees who is live today. Filter by category, save brands, get notifications. The real Lisbon, not the tourist version.',
    s3e: 'CURATOR', s3t: 'PUBLISH', s3b: 'The curator publishes market dates and manages the calendar. Makers check in when they arrive. Together, they build a market with real digital visibility.',
    loopEyebrow: 'THE PRODUCT LOOP',
    loopTitle: ['DISCOVER.', 'SAVE.', 'RETURN.'],
    loopSub: 'The market is the first encounter. WEAREMAKERS.PT makes it permanent.',
    ls1t: 'DISCOVER', ls1b: 'The visitor finds WEAREMAKERS.PT — before, during or after visiting a market. They see who is live today, explore brand profiles, discover what is nearby.',
    ls2t: 'SAVE', ls2b: 'They find Oakwall. They tap the heart and leave their email. The brand is saved. If there is an active offer, it triggers automatically — shown at the stall.',
    ls3t: 'NOTIFY', ls3b: 'Oakwall checks in at a market. The visitor receives a push notification: "Oakwall is live at Príncipe Real today."',
    ls4t: 'RETURN', ls4b: 'The visitor returns. The loop closes. A single market encounter becomes an ongoing relationship between a maker and their audience.',
    featEyebrow: 'PLATFORM FEATURES',
    featTitle: ['REAL.', 'LIVE.', 'NOW.'],
    featSub: 'Everything the platform does — for independent makers and market curators — built into one real-time system.',
    f1tag: 'REAL-TIME', f1t: 'LIVE CHECK-INS', f1b: 'Makers go live with one tap — at any market, any day. Green badge on the card. Live counter on the market page. Auto-refresh every 60 seconds.',
    f2tag: 'VISITOR', f2t: 'PERSONAL ITINERARY', f2b: 'Personal itinerary builder with morning, afternoon and evening slots. Open markets form the foundation. A red badge in the nav shows how many stops have been added.',
    f3tag: 'PWA', f3t: 'PUSH NOTIFICATIONS', f3b: 'Save a brand. Get notified when they go live — at any market, any day. Installable to home screen. No app store required.',
    f4tag: 'MAKER', f4t: 'OFFER SYSTEM', f4b: 'Makers activate an offer with a unique promo code. Saving a brand with an active offer triggers the modal automatically. Shown at the stall as a digital stamp.',
    f5tag: 'CURATOR', f5t: 'PROMO KIT', f5b: 'One tap copies all checked-in brand handles into a formatted caption for Instagram Stories. Built for the real workflow of a market organiser.',
    f6tag: 'MULTILINGUAL', f6t: '6 LANGUAGES', f6b: 'Every brand bio written in Portuguese is automatically shown in EN, ES, DE, FR and IT. Visitors read in their language. Makers write in theirs. Translation is invisible.',
    spLabelL: 'For independent makers',
    spTitleL: ['BE', 'FOUND.', 'LIVE.', 'GROW.'],
    spBodyL: "You already do the hard part — showing up. WEAREMAKERS.PT handles the rest. Be visible before visitors arrive. Build an audience that returns to find you at any market, any day.",
    spListL: ['Brand profile with photos, tags, price range and Instagram link', 'One-tap check-in — go live at any market', 'Check in at multiple markets simultaneously', 'Email capture when visitors save your brand', 'Offer system — promo codes used at the stall', 'Analytics — views, saves, IG taps per market', 'Market calendar — publish your upcoming dates'],
    spCtaL: 'REGISTER YOUR BRAND →', spFreeL: 'Always free · Zero commission · Pure reach',
    spLabelM: 'For market curators',
    spTitleM: ['MANAGE', 'YOUR MARKET.', 'DIGITALLY.'],
    spBodyM: 'Run the market. WEAREMAKERS.PT handles the digital presence. Curate your selection, publish your dates, reach thousands of visitors automatically.',
    spListM: ['Curator profile — your market\'s permanent digital home', 'Curate your top brands — appears in the homepage carousel', 'Publish market dates — manage your own calendar', 'Promo Kit — copy all live handles with one tap for Stories', 'Brand picker — choose which brands represent your market', 'Reach in 6 languages, automatically', 'Dashboard — visitors, saves, brand activity'],
    spCtaM: 'REGISTER YOUR MARKET →', spFreeM: 'Takes 10 minutes to set up · Free to join',
    faqEyebrow: 'QUESTIONS', faqTitle: ['QUESTIONS', '& ANSWERS.'],
    faqTabM: 'Makers', faqTabC: 'Curators',
    fqM: [
      { q: 'IS WEAREMAKERS.PT REALLY FREE?', a: 'Yes, completely. Listing your brand, checking in, receiving visitor emails, appearing in market pages — all free. Zero commission on sales. The platform grows when makers grow.' },
      { q: 'HOW DOES CHECK-IN WORK?', a: "Open the Maker Portal, select the market and activate the toggle. Your brand instantly moves to the live section. When you pack up, tap again to go offline. You can check in at multiple markets simultaneously." },
      { q: 'WHAT ABOUT VISITOR EMAILS?', a: "When a visitor saves your brand, they're invited to leave their email for notifications. Those leads are yours — they appear in your dashboard and can be exported as CSV." },
      { q: 'DO I NEED A WEBSITE TO JOIN?', a: 'No. Your WEAREMAKERS.PT profile becomes your online presence. If you have a website, we add a Shop Online button that drives traffic directly to your store.' },
    ],
    fqC: [
      { q: 'HOW DO I REGISTER AS A CURATOR?', a: 'Register as a Curator in the portal. Our team opens your market dates and assigns you as the official curator. Multiple curators can manage the same location on different days.' },
      { q: 'CAN I MANAGE MULTIPLE MARKETS?', a: 'Yes. Each curator can have multiple markets associated with their profile — all in the same account, with separate dashboards per market.' },
      { q: 'HOW DOES THE PROMO KIT WORK?', a: 'One tap copies all Instagram handles of brands with active check-ins into a formatted caption for Instagram Stories. Paste directly — names, emojis, hashtags.' },
      { q: 'WHAT LANGUAGES DO MY MARKETS APPEAR IN?', a: 'Your markets and brand bios are automatically shown in 6 languages — PT, EN, ES, DE, FR and IT. You manage everything in Portuguese.' },
    ],
    ftaEyebrow: 'LISBON · WE ARE MAKERS · LIVE TODAY',
    ftaTitle: ['JOIN', 'THE MOVEMENT.'],
    ftaTitleEm: [false, true],
    fctaPrimary: 'JOIN AS A MAKER →', fctaSecondary: 'REGISTER MY MARKET →',
    fctaSub: 'Free for makers · Free for curators · Zero commission',
  },
}

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const C = {
  paper: '#F0EBE1', paper2: '#E6DFD3', paper3: '#D4CAB8',
  ink: '#111009', ink2: '#2A2820', ink3: '#4A4840', ink4: '#7A7870',
  red: '#E8341A', white: '#FFFFFF',
}

export default function PitchPage() {
  const [lang, setLang] = useState<Lang>('pt')
  const [faqTab, setFaqTab] = useState<'makers' | 'curators'>('makers')
  const [menuOpen, setMenuOpen] = useState(false)
  const t = T[lang]

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '16px', lineHeight: 1.6, background: C.ink, color: C.paper, overflowX: 'hidden' }}>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.055, backgroundImage: GRAIN }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: C.ink, borderBottom: `3px solid ${C.red}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 1000 }}>
        <Link href="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', color: C.red, textTransform: 'uppercase', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          WEAREMAKERS<span style={{ color: C.paper }}>.PT</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#como-funciona" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navHow}</a>
          <a href="#para-quem" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navFor}</a>
          <a href="#plataforma" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navFeat}</a>
          <div style={{ display: 'flex', gap: '0', border: `1px solid ${C.ink3}` }}>
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px', background: lang === l ? C.red : 'transparent', color: lang === l ? C.white : C.ink4, border: 'none', cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/auth/register" style={{ background: C.red, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none' }}>
            {t.navCta}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', paddingTop: '60px', background: C.ink, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px 80px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent calc(100%/12 - 1px),rgba(255,255,255,.018) calc(100%/12 - 1px),rgba(255,255,255,.018) calc(100%/12))', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.24em', color: C.red, textTransform: 'uppercase', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.red, display: 'inline-block', animation: 'blink 2.2s ease-in-out infinite' }} />
          {t.heroKicker}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(64px,9vw,128px)', lineHeight: 0.88, textTransform: 'uppercase', color: C.paper, letterSpacing: '-0.02em', marginBottom: '48px', borderLeft: `5px solid ${C.red}`, paddingLeft: '32px' }}>
          {t.heroH1.map((line, i) => (
            <span key={i} style={{ color: t.heroH1em[i] ? C.red : C.paper, fontStyle: t.heroH1em[i] ? 'italic' : 'normal', display: 'block' }}>{line}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '18px', color: C.ink4, lineHeight: 1.75 }}>
            <p style={{ marginBottom: '16px' }}>{t.heroBody}</p>
            <p><strong style={{ color: C.paper }}>{t.heroBody2}</strong></p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ background: C.red, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none' }}>{t.heroCta1}</Link>
              <a href="#como-funciona" style={{ border: `2px solid ${C.paper3}`, color: C.paper, fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '16px 32px', textDecoration: 'none' }}>{t.heroCta2}</a>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.heroSub}</div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: C.red, height: '42px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        <div style={{ display: 'flex', animation: 'ticker 36s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri} style={{ display: 'flex' }}>
              {['200+ CRIADORES', '6 IDIOMAS', 'SEMPRE GRATUITO', 'SEM COMISSÃO', 'TEMPO REAL', 'NOTIFICAÇÕES PUSH', 'KIT PROMO', 'MERCADOS DE LISBOA'].map((item, i) => (
                <span key={i} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.white, padding: '0 32px', height: '42px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  {item} <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,.45)', display: 'inline-block' }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: C.paper2, borderBottom: `1px solid ${C.paper3}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { n: t.stat1n, l: t.stat1l },
          { n: t.stat2n, l: t.stat2l },
          { n: t.stat3n, l: t.stat3l },
          { n: t.stat4n, l: t.stat4l },
        ].map((s, i) => (
          <div key={i} style={{ padding: '44px 52px', borderRight: i < 3 ? `1px solid ${C.paper3}` : 'none' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '60px', color: C.ink, lineHeight: 1, marginBottom: '8px' }}>
              <span style={{ color: C.red }}>{s.n}</span>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.7 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── PROBLEM ── */}
      <section style={{ background: C.ink, padding: '120px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,5vw,64px)', lineHeight: 0.92, textTransform: 'uppercase', color: C.paper, borderLeft: `4px solid ${C.red}`, paddingLeft: '28px' }}>
          {t.probQ.map((line, i) => (
            <span key={i} style={{ color: t.probQem[i] ? C.red : C.paper, fontStyle: t.probQem[i] ? 'italic' : 'normal', display: 'block' }}>{line}</span>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', color: C.paper, lineHeight: 1, marginBottom: '22px' }}>{t.probTitle}</div>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.78, marginBottom: '16px' }}>{t.probBody}</p>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.78, marginBottom: '32px' }}><strong style={{ color: C.paper }}>{t.probBody2}</strong></p>
          <div style={{ borderLeft: `3px solid ${C.red}`, padding: '18px 22px', background: C.ink2, fontSize: '15px', color: C.paper3, lineHeight: 1.65, fontStyle: 'italic' }}>{t.probCallout}</div>
        </div>
      </section>

      {/* ── AUDIENCES ── */}
      <section id="para-quem" style={{ background: C.ink, padding: '120px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-end', marginBottom: '56px' }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: C.red, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <span style={{ width: '24px', height: '1px', background: C.red, display: 'inline-block' }} /> {t.audEyebrow}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,7vw,88px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.88 }}>
              {t.audTitle.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.72 }}>{t.audSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
          {[
            { i: t.a1i, tl: t.a1t, b: t.a1b, f: t.a1f, cta: t.a1cta },
            { i: t.a2i, tl: t.a2t, b: t.a2b, f: t.a2f, cta: t.a2cta },
          ].map((card, ci) => (
            <div key={ci} style={{ background: C.ink2, border: `1px solid ${C.ink3}`, padding: '44px 38px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.red, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '28px' }}>{card.i}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: C.paper, lineHeight: 1, marginBottom: '20px' }}>
                {card.tl.map((l, i) => <div key={i}>{l}</div>)}
              </div>
              <p style={{ fontSize: '15px', color: C.ink4, lineHeight: 1.75, marginBottom: '32px', flex: 1 }}>{card.b}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', borderTop: `1px solid ${C.ink3}`, paddingTop: '24px', marginBottom: '28px' }}>
                {card.f.map((item, i) => (
                  <li key={i} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink4, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', gap: '10px', lineHeight: 1.5 }}>
                    <span style={{ color: C.red, flexShrink: 0 }}>—</span>{item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.red, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', borderBottom: `1px solid ${C.red}`, paddingBottom: '2px', display: 'inline-block' }}>{card.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" style={{ background: C.paper, padding: '120px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-end', marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,7vw,88px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88 }}>
            {t.howTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.7 }}>{t.howSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {[
            { e: t.s1e, t: t.s1t, b: t.s1b, n: '01' },
            { e: t.s2e, t: t.s2t, b: t.s2b, n: '02' },
            { e: t.s3e, t: t.s3t, b: t.s3b, n: '03' },
          ].map((s, i) => (
            <div key={i} style={{ background: C.paper2, border: `1px solid ${C.paper3}`, padding: '40px 36px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: C.red, letterSpacing: '0.16em', textTransform: 'uppercase', border: `1px solid ${C.red}`, padding: '3px 8px', display: 'inline-block', marginBottom: '20px' }}>{s.e}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '80px', color: C.paper3, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, borderBottom: `2px solid ${C.red}`, paddingBottom: '12px', display: 'inline-block', marginBottom: '16px' }}>{s.t}</div>
              <p style={{ fontSize: '15px', color: C.ink3, lineHeight: 1.75 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRODUCT LOOP ── */}
      <section style={{ background: C.paper, padding: '0 80px 120px' }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: C.red, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ width: '24px', height: '1px', background: C.red, display: 'inline-block' }} /> {t.loopEyebrow}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,7vw,88px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88, marginBottom: '20px' }}>
            {t.loopTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.7, maxWidth: '600px' }}>{t.loopSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: `1px solid ${C.paper3}` }}>
          {[
            { t: t.ls1t, b: t.ls1b, n: '1' },
            { t: t.ls2t, b: t.ls2b, n: '2' },
            { t: t.ls3t, b: t.ls3b, n: '3' },
            { t: t.ls4t, b: t.ls4b, n: '4' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '40px 28px', borderRight: i < 3 ? `1px solid ${C.paper3}` : 'none', position: 'relative' }}>
              {i < 3 && <div style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', width: '30px', height: '30px', background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', color: C.white, zIndex: 2 }}>→</div>}
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '68px', color: C.paper3, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '12px' }}>{s.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, borderBottom: `2px solid ${C.red}`, paddingBottom: '10px', display: 'inline-block', marginBottom: '14px' }}>{s.t}</div>
              <p style={{ fontSize: '14px', color: C.ink3, lineHeight: 1.75 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="plataforma" style={{ background: C.ink2, padding: '120px 80px' }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: C.red, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ width: '24px', height: '1px', background: C.red, display: 'inline-block' }} /> {t.featEyebrow}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,7vw,88px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.88, marginBottom: '20px' }}>
            {t.featTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.7, maxWidth: '540px' }}>{t.featSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {[
            { tag: t.f1tag, tl: t.f1t, b: t.f1b },
            { tag: t.f2tag, tl: t.f2t, b: t.f2b },
            { tag: t.f3tag, tl: t.f3t, b: t.f3b },
            { tag: t.f4tag, tl: t.f4t, b: t.f4b },
            { tag: t.f5tag, tl: t.f5t, b: t.f5b },
            { tag: t.f6tag, tl: t.f6t, b: t.f6b },
          ].map((f, i) => (
            <div key={i} style={{ background: C.ink, border: `1px solid ${C.ink3}`, padding: '36px 32px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: C.red, letterSpacing: '0.14em', textTransform: 'uppercase', border: `1px solid ${C.red}`, padding: '3px 8px', display: 'inline-block', marginBottom: '20px' }}>{f.tag}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', color: C.paper, lineHeight: 1, marginBottom: '14px' }}>{f.tl}</div>
              <p style={{ fontSize: '14px', color: C.ink4, lineHeight: 1.78 }}>{f.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPLIT MAKERS ── */}
      <section style={{ background: C.red, padding: '88px 80px' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: '20px' }}>{t.spLabelL}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,72px)', textTransform: 'uppercase', lineHeight: 0.88, marginBottom: '24px', color: C.white }}>
          {t.spTitleL.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <p style={{ fontSize: '17px', lineHeight: 1.72, marginBottom: '36px', color: 'rgba(255,255,255,.78)' }}>{t.spBodyL}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', marginBottom: '36px' }}>
          {t.spListL.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', lineHeight: 1.55, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.15)', display: 'flex', gap: '12px', color: 'rgba(255,255,255,.72)' }}>
              <span style={{ color: 'rgba(255,255,255,.4)', flexShrink: 0 }}>—</span>{item}
            </li>
          ))}
        </ul>
        <Link href="/auth/register" style={{ background: C.white, color: C.red, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none', display: 'inline-block' }}>{t.spCtaL}</Link>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '14px', color: 'rgba(255,255,255,.4)' }}>{t.spFreeL}</div>
      </section>

      {/* ── SPLIT CURATORS ── */}
      <section style={{ background: C.ink, padding: '88px 80px', borderTop: `1px solid ${C.ink3}` }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink4, marginBottom: '20px' }}>{t.spLabelM}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,72px)', textTransform: 'uppercase', lineHeight: 0.88, marginBottom: '24px', color: C.paper }}>
          {t.spTitleM.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <p style={{ fontSize: '17px', lineHeight: 1.72, marginBottom: '36px', color: C.ink4 }}>{t.spBodyM}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', marginBottom: '36px' }}>
          {t.spListM.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', lineHeight: 1.55, padding: '11px 0', borderBottom: `1px solid ${C.ink3}`, display: 'flex', gap: '12px', color: C.ink4 }}>
              <span style={{ color: C.red, flexShrink: 0 }}>—</span>{item}
            </li>
          ))}
        </ul>
        <Link href="/auth/register" style={{ background: C.red, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none', display: 'inline-block' }}>{t.spCtaM}</Link>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '14px', color: C.ink3 }}>{t.spFreeM}</div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: C.paper, padding: '120px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginBottom: '56px' }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: C.red, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ width: '24px', height: '1px', background: C.red, display: 'inline-block' }} /> {t.faqEyebrow}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,7vw,88px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88 }}>
              {t.faqTitle.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <div style={{ display: 'flex', border: `1px solid ${C.paper3}`, overflow: 'hidden' }}>
            {(['makers', 'curators'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setFaqTab(tab)} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 18px', cursor: 'pointer', background: faqTab === tab ? C.ink : 'transparent', color: faqTab === tab ? C.white : C.ink4, border: 'none', borderRight: i === 0 ? `1px solid ${C.paper3}` : 'none' }}>
                {tab === 'makers' ? t.faqTabM : t.faqTabC}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
          {(faqTab === 'makers' ? t.fqM : t.fqC).map((item, i) => (
            <div key={i} style={{ background: C.paper2, border: `1px solid ${C.paper3}`, padding: '32px 36px' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, marginBottom: '14px', paddingBottom: '14px', borderBottom: `2px solid ${C.red}`, display: 'block' }}>{item.q}</div>
              <p style={{ fontSize: '15px', color: C.ink3, lineHeight: 1.75 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ background: C.ink, borderTop: `3px solid ${C.red}`, padding: '100px 80px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.red, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '24px' }}>{t.ftaEyebrow}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,8vw,120px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.87, marginBottom: '44px' }}>
          {t.ftaTitle.map((l, i) => (
            <div key={i} style={{ color: t.ftaTitleEm[i] ? C.red : C.paper, fontStyle: t.ftaTitleEm[i] ? 'italic' : 'normal' }}>{l}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <Link href="/auth/register" style={{ background: C.red, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none' }}>{t.fctaPrimary}</Link>
          <Link href="/auth/register" style={{ background: C.white, color: C.ink, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none' }}>{t.fctaSecondary}</Link>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.fctaSub}</div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink2, borderTop: `1px solid ${C.ink3}`, padding: '52px 80px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '52px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', color: C.red, textTransform: 'uppercase', marginBottom: '8px' }}>WEAREMAKERS.PT</div>
          <p style={{ fontSize: '14px', color: C.ink4, lineHeight: 1.7, maxWidth: '280px' }}>The real-time street market discovery platform for Lisbon.</p>
        </div>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Para Criadores</div>
          {['Registar marca', 'Portal do criador', 'Sistema de ofertas', 'Análises'].map((l, i) => (
            <div key={i}><Link href="/auth/register" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{l}</Link></div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Para Curadores</div>
          {['Registar mercado', 'Portal do curador', 'Kit Promo', 'Gerir datas'].map((l, i) => (
            <div key={i}><Link href="/auth/register" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{l}</Link></div>
          ))}
        </div>
      </footer>
      <div style={{ background: C.ink2, borderTop: `1px solid ${C.ink3}`, padding: '20px 80px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.1em' }}>© 2026 WEAREMAKERS.PT — Lisbon, Portugal</span>
        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.1em' }}>Privacy · Terms · Instagram</span>
      </div>

    </div>
  )
}
