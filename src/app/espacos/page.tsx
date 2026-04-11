'use client'
import { useState } from 'react'
import Link from 'next/link'

type Lang = 'pt' | 'en'

const GOLD = '#C49A2A'

const T = {
  pt: {
    navBadge: 'Para Espaços', navWho: 'Para Quem É', navBen: 'O Que Recebe', navHow: 'Como Funciona', navCta: 'CONTACTAR →',
    heroKicker: 'LISBOA · WE ARE MAKERS · ESPAÇOS PARCEIROS',
    heroH1: ['O SEU ESPAÇO', 'JÁ ACOLHE', 'CRIADORES.', 'O MUNDO', 'NÃO SABE.'],
    heroH1em: [false, false, false, true, true],
    heroBody: 'Todos os dias, criadores independentes montam as suas bancas em praças, pátios, fábricas e jardins por toda Lisboa. O espaço existe. Os criadores existem. Mas os visitantes — locais e internacionais — não sabem que ali está a acontecer algo.',
    heroBody2: 'A WEAREMAKERS.PT coloca o seu espaço no mapa. Em tempo real. Em 6 idiomas. Sem burocracia.',
    heroCta1: 'REGISTAR O MEU ESPAÇO →', heroCta2: 'VER SE SE APLICA ↓',
    heroSub: 'Juntas de Freguesia · Proprietários Privados · Espaços Culturais · Sem custos',
    stat1n: '6M', stat1l: 'Turistas visitam Lisboa por ano',
    stat2n: '200+', stat2l: 'Criadores independentes activos na plataforma',
    stat3n: '6', stat3l: 'Idiomas — PT · EN · ES · DE · FR · IT',
    stat4n: '0€', stat4l: 'Custo para o espaço parceiro',
    whoEyebrow: 'PARA QUEM É',
    whoTitle: ['NEM TODOS', 'OS ESPAÇOS', 'SÃO IGUAIS.'],
    whoSub: 'A WEAREMAKERS.PT trabalha com qualquer espaço que acolha criadores independentes — seja uma praça pública, um pátio privado, um mercado histórico ou uma fábrica reconvertida.',
    wc: [
      { num: '01 · JUNTAS DE FREGUESIA', name: 'ESPAÇOS PÚBLICOS', body: 'Gerem praças, jardins, largos e espaços públicos onde os mercados acontecem. A parceria dá visibilidade institucional ao bairro e aos criadores que nele operam — sem custos.', tags: ['Praças públicas', 'Largos e jardins', 'Feiras de bairro', 'Mercados municipais'] },
      { num: '02 · PROPRIETÁRIOS PRIVADOS', name: 'ESPAÇOS PRIVADOS', body: 'Proprietários de espaços com área disponível — pátios, armazéns, fábricas reconvertidas, quintas urbanas — que acolhem mercados de forma regular ou pontual.', tags: ['Fábricas reconvertidas', 'Pátios e armazéns', 'Quintas urbanas', 'Espaços culturais'] },
      { num: '03 · MERCADOS ESTABELECIDOS', name: 'MERCADOS COM HISTÓRIA', body: 'Mercados históricos, feiras tradicionais ou eventos recorrentes que já têm criadores mas carecem de visibilidade digital. A plataforma coloca-os no mapa em tempo real.', tags: ['Mercados históricos', 'Feiras tradicionais', 'Eventos recorrentes', 'Mercados sazonais'] },
      { num: '04 · ESPAÇOS CULTURAIS', name: 'CULTURA E CRIATIVIDADE', body: 'Museus, centros culturais, galerias e espaços de co-criação que integram mercados de criadores nas suas programações. A WEAREMAKERS.PT amplifica o alcance do evento.', tags: ['Centros culturais', 'Galerias e museus', 'Espaços de co-criação', 'Programação cultural'] },
    ],
    probEyebrow: 'O PROBLEMA',
    probQ: ['O MERCADO', 'ACONTECE.', 'OS VISITANTES', 'NÃO', 'SABEM.'],
    probQem: [false, false, false, false, true],
    probTitle: 'O espaço existe. Os criadores estão lá. Mas a cidade não vê.',
    probBody: 'Lisboa tem dezenas de mercados de criadores activos todas as semanas. Espaços com história, com energia, com talento real. Mas não existe uma plataforma que mostre ao visitante o que está a acontecer, agora mesmo, na cidade.',
    probBody2: 'Os espaços parceiros perdem visibilidade. Os criadores perdem audiência. Os visitantes perdem a experiência. Esse ciclo está partido. A WEAREMAKERS.PT repara-o.',
    probCallout: '"O espaço está cheio de talento. Mas os visitantes passam na rua e nem sabem que existe. Não temos como dizer ao mundo que estamos aqui, hoje."',
    benEyebrow: 'O QUE RECEBE',
    benTitle: ['VISIBILIDADE.', 'IMPACTO.', 'DADOS.'],
    benSub: 'Tudo o que a parceria com a WEAREMAKERS.PT dá ao seu espaço — sem custos, sem burocracia, configurado em conjunto com a nossa equipa.',
    ben: [
      { tag: 'VISIBILIDADE', t: 'PERFIL OFICIAL NO MAPA', b: 'O seu espaço tem uma página própria na plataforma. Aparece no mapa interactivo de Lisboa com todos os mercados activos. Visível para qualquer visitante que procure criadores na cidade.' },
      { tag: 'TEMPO REAL', t: 'MERCADOS EM DIRECTO', b: 'Cada vez que um criador faz check-in no seu espaço, a plataforma actualiza em tempo real. Os visitantes vêem quem está lá agora. O seu espaço torna-se um destino vivo.' },
      { tag: 'MULTILÍNGUE', t: '6 IDIOMAS AUTOMÁTICOS', b: 'O conteúdo do seu espaço é automaticamente apresentado em PT, EN, ES, DE, FR e IT. Os 6 milhões de turistas que visitam Lisboa por ano vêem o seu espaço na sua língua.' },
      { tag: 'EDITORIAL', t: 'NEIGHBORHOOD LOOPS', b: 'Artigos editoriais sobre cada bairro de Lisboa — optimizados para SEO, indexados pelo Google em 6 idiomas. O seu espaço e os seus criadores aparecem nestes artigos como destino cultural permanente.' },
      { tag: 'DADOS', t: 'RELATÓRIOS DE IMPACTO', b: 'Relatórios mensais com os dados de visibilidade do seu espaço: criadores activos, visitas à página, alcance internacional por idioma. Informação concreta para comunicar o impacto cultural.' },
      { tag: 'CALENDÁRIO', t: 'AGENDA PÚBLICA DE MERCADOS', b: 'Todos os mercados agendados no seu espaço ficam visíveis na plataforma com antecedência. Os visitantes podem planear a visita. O seu espaço tem uma agenda digital própria.' },
    ],
    howEyebrow: 'COMO FUNCIONA',
    howTitle: ['QUATRO', 'PASSOS.', 'ESPAÇO', 'NO MAPA.'],
    howSub: 'A integração do seu espaço na WEAREMAKERS.PT é simples e feita em conjunto com a nossa equipa. Não é necessário ter conhecimentos técnicos. Demora menos de uma semana.',
    steps: [
      { n: '01', t: 'CONTACTO', b: 'Envie-nos um email ou preencha o formulário. A nossa equipa responde em 48 horas para perceber o seu espaço, o tipo de mercados e o que precisa.' },
      { n: '02', t: 'CONFIGURAÇÃO', b: 'Criamos juntos o perfil do espaço na plataforma — nome, localização GPS, descrição, tipos de mercado, calendário anual. A equipa WAM trata de tudo.' },
      { n: '03', t: 'CRIADORES', b: 'Os criadores que operam no seu espaço registam-se na plataforma e fazem check-in quando chegam. O espaço activa-se automaticamente sempre que há um mercado em curso.' },
      { n: '04', t: 'VISIBILIDADE', b: 'O espaço aparece no mapa, na agenda e nas pesquisas. Os visitantes descobrem-no em tempo real. Os relatórios mensais mostram o impacto.' },
    ],
    sp1label: 'Para juntas de freguesia',
    sp1title: ['O VOSSO', 'BAIRRO.', 'VISÍVEL', 'AO MUNDO.'],
    sp1body: 'A junta de freguesia gere o espaço público. A WEAREMAKERS.PT torna-o visível internacionalmente. Uma parceria que valoriza o ecossistema criativo local e posiciona o bairro como destino de turismo cultural autêntico.',
    sp1list: ['Perfil oficial da freguesia com todos os espaços e mercados', 'Visibilidade em 6 idiomas para visitantes internacionais', 'Calendário público de todos os mercados da freguesia', 'Relatórios de impacto para comunicar à assembleia de freguesia', 'Destaque editorial nas Neighborhood Loops — conteúdo SEO permanente', 'Os criadores locais ficam associados ao perfil da junta'],
    sp1cta: 'CONTACTAR A EQUIPA WAM →', sp1free: 'Parceria sem custo · Sem burocracia técnica · Apoio contínuo',
    sp1email: 'juntas@wearemakers.pt',
    sp2label: 'Para espaços privados',
    sp2title: ['O SEU', 'ESPAÇO.', 'EM DIRECTO.'],
    sp2body: 'Tem um espaço que acolhe criadores — regular ou pontualmente. A WEAREMAKERS.PT transforma cada mercado num evento visível para toda a cidade. Os visitantes chegam até si. Os criadores têm mais audiência.',
    sp2list: ['Perfil do espaço no mapa interactivo de Lisboa', 'Activação automática sempre que há um mercado em curso', 'Calendário público de eventos e mercados no espaço', 'Visibilidade em 6 idiomas sem qualquer esforço adicional', 'Os criadores que operam no espaço ficam associados ao perfil', 'Relatórios mensais de visibilidade e impacto digital'],
    sp2cta: 'REGISTAR O MEU ESPAÇO →', sp2free: 'Configuração em conjunto · Sem custos para o espaço · Apoio da equipa WAM',
    sp2email: 'espacos@wearemakers.pt',
    impEyebrow: 'O IMPACTO EM NÚMEROS',
    impTitle: ['PORQUE É', 'QUE VALE', 'A PENA.'],
    impSub: 'Lisboa é uma das cidades mais visitadas da Europa. O turismo cultural é o segmento que mais cresce. O mercado de rua de criadores independentes é exactamente o que os visitantes procuram — e não conseguem encontrar.',
    imp: [
      { n: '6M+', l: 'Turistas visitam Lisboa por ano — e procuram experiências autênticas' },
      { n: '78%', l: 'Dos viajantes activos preferem experiências locais e autênticas a atracções turísticas tradicionais' },
      { n: '0€', l: 'Custo para o espaço parceiro — sem taxas, sem comissões' },
    ],
    faqEyebrow: 'PERGUNTAS FREQUENTES',
    faqTitle: ['PERGUNTAS', '& RESPOSTAS.'],
    faq: [
      { q: 'O NOSSO ESPAÇO TEM DE SER UMA JUNTA DE FREGUESIA?', a: 'Não. A WEAREMAKERS.PT trabalha com qualquer tipo de espaço que acolha criadores independentes — público ou privado. O que importa é que o espaço seja um local onde criadores vendem o seu trabalho.' },
      { q: 'QUANTO CUSTA A PARCERIA?', a: 'Nada. A parceria com a WEAREMAKERS.PT é gratuita para o espaço. Não há taxas de adesão, não há comissões sobre vendas, não há mensalidades.' },
      { q: 'OS CRIADORES TÊM DE SE REGISTAR TAMBÉM?', a: 'Sim — mas isso é responsabilidade dos criadores, não do espaço. Os criadores que queiram aparecer registam-se de forma autónoma e fazem check-in no espaço quando chegam.' },
      { q: 'O QUE ACONTECE SE O MERCADO FOR CANCELADO?', a: 'O curador do mercado actualiza o estado na plataforma e os visitantes são informados automaticamente. O espaço não precisa de fazer nada — o sistema gere a comunicação.' },
      { q: 'O ESPAÇO SÓ TEM MERCADOS OCASIONAIS. VALE A PENA?', a: 'Sim. O perfil do espaço fica permanentemente visível na plataforma, mesmo quando não há mercados activos. Um espaço com dois mercados por mês tem exactamente o mesmo perfil que um que funciona todas as semanas.' },
      { q: 'COMO APARECEM OS DADOS DOS VISITANTES NOS RELATÓRIOS?', a: 'Os relatórios mensais mostram visitas à página, criadores activos, mercados realizados e alcance por idioma — sem dados pessoais de visitantes individuais. São relatórios de impacto agregados.' },
    ],
    ftaEyebrow: 'LISBOA · WE ARE MAKERS · ESPAÇOS PARCEIROS',
    ftaTitle: ['O SEU ESPAÇO', 'NO MAPA.', 'AGORA.'],
    ftaTitleEm: [false, false, true],
    ftaCta1: 'REGISTAR O MEU ESPAÇO →', ftaCta2: 'SOU JUNTA DE FREGUESIA →',
    ftaSub: 'Parceria sem custo · Sem burocracia técnica · Configuração em menos de uma semana',
  },
  en: {
    navBadge: 'For Spaces', navWho: "Who It's For", navBen: 'What You Get', navHow: 'How It Works', navCta: 'CONTACT →',
    heroKicker: 'LISBON · WE ARE MAKERS · PARTNER SPACES',
    heroH1: ['YOUR SPACE', 'ALREADY HOSTS', 'MAKERS.', 'THE WORLD', "DOESN'T KNOW."],
    heroH1em: [false, false, false, true, true],
    heroBody: 'Every day, independent makers set up their stalls in squares, courtyards, factories and gardens across Lisbon. The space exists. The makers exist. But visitors — local and international — have no way of knowing something is happening there.',
    heroBody2: 'WEAREMAKERS.PT puts your space on the map. In real time. In 6 languages. No red tape.',
    heroCta1: 'REGISTER MY SPACE →', heroCta2: 'SEE IF IT APPLIES ↓',
    heroSub: 'Parish Councils · Private Owners · Cultural Spaces · At No Cost',
    stat1n: '6M', stat1l: 'Tourists visit Lisbon per year',
    stat2n: '200+', stat2l: 'Independent makers active on the platform',
    stat3n: '6', stat3l: 'Languages — PT · EN · ES · DE · FR · IT',
    stat4n: '0€', stat4l: 'Cost to the partner space',
    whoEyebrow: 'WHO IS IT FOR',
    whoTitle: ['NOT ALL', 'SPACES ARE', 'THE SAME.'],
    whoSub: "WEAREMAKERS.PT works with any space that hosts independent makers — whether it's a public square, a private courtyard, a historic market or a converted factory.",
    wc: [
      { num: '01 · PARISH COUNCILS', name: 'PUBLIC SPACES', body: 'They manage squares, gardens and public spaces where markets happen. The parish partnership gives institutional visibility to the neighbourhood and the makers who operate there — at no cost.', tags: ['Public squares', 'Gardens and plazas', 'Neighbourhood fairs', 'Municipal markets'] },
      { num: '02 · PRIVATE OWNERS', name: 'PRIVATE SPACES', body: 'Owners of spaces with available area — courtyards, warehouses, converted factories, urban farms — that host markets regularly or occasionally. WEAREMAKERS.PT brings visitors to you.', tags: ['Converted factories', 'Courtyards & warehouses', 'Urban farms', 'Cultural spaces'] },
      { num: '03 · ESTABLISHED MARKETS', name: 'MARKETS WITH HISTORY', body: 'Historic markets, traditional fairs or recurring events that already have makers but lack digital visibility. The platform puts them on the map in real time.', tags: ['Historic markets', 'Traditional fairs', 'Recurring events', 'Seasonal markets'] },
      { num: '04 · CULTURAL SPACES', name: 'CULTURE & CREATIVITY', body: "Museums, cultural centres, galleries and co-creation spaces that integrate maker markets into their programming. WEAREMAKERS.PT amplifies the event's reach.", tags: ['Cultural centres', 'Galleries & museums', 'Co-creation spaces', 'Cultural programming'] },
    ],
    probEyebrow: 'THE PROBLEM',
    probQ: ['THE MARKET', 'HAPPENS.', 'VISITORS', "DON'T", 'KNOW.'],
    probQem: [false, false, false, false, true],
    probTitle: "The space exists. The makers are there. But the city doesn't see it.",
    probBody: "Lisbon has dozens of active maker markets every week. Spaces with history, energy and real talent. But there's no platform showing visitors what's happening right now in the city.",
    probBody2: "Partner spaces lose visibility. Makers lose audience. Visitors miss the experience. That loop is broken. WEAREMAKERS.PT fixes it.",
    probCallout: '"The space is full of talent. But visitors walk past and don\'t even know it exists. We have no way of telling the world we\'re here, today."',
    benEyebrow: 'WHAT YOU GET',
    benTitle: ['VISIBILITY.', 'IMPACT.', 'DATA.'],
    benSub: 'Everything the WEAREMAKERS.PT partnership gives your space — at no cost, no red tape, set up together with our team.',
    ben: [
      { tag: 'VISIBILITY', t: 'OFFICIAL PROFILE ON THE MAP', b: "Your space gets its own page on the platform. It appears on Lisbon's interactive map with all active markets. Visible to any visitor looking for makers in the city." },
      { tag: 'REAL TIME', t: 'MARKETS LIVE', b: 'Every time a maker checks in at your space, the platform updates in real time. Visitors see who is there right now. Your space becomes a living destination.' },
      { tag: 'MULTILINGUAL', t: '6 LANGUAGES AUTOMATICALLY', b: "Your space's content is automatically shown in PT, EN, ES, DE, FR and IT. The 6 million tourists who visit Lisbon per year see your space in their language." },
      { tag: 'EDITORIAL', t: 'NEIGHBORHOOD LOOPS', b: 'Long editorial articles about each Lisbon neighbourhood — SEO-optimised, indexed in 6 languages. Your space and its makers appear as a permanent cultural destination.' },
      { tag: 'DATA', t: 'IMPACT REPORTS', b: "Monthly reports with your space's visibility data: active makers, page visits, international reach by language. Concrete information to communicate the space's cultural impact." },
      { tag: 'CALENDAR', t: 'PUBLIC MARKET SCHEDULE', b: 'All markets scheduled at your space are visible on the platform in advance. Visitors can plan their visit. Your space has its own digital calendar.' },
    ],
    howEyebrow: 'HOW IT WORKS',
    howTitle: ['FOUR', 'STEPS.', 'SPACE', 'ON THE MAP.'],
    howSub: 'Integrating your space into WEAREMAKERS.PT is simple and done with our team. No technical knowledge required. It takes less than a week.',
    steps: [
      { n: '01', t: 'CONTACT', b: 'Send us an email or fill in the form. Our team responds within 48 hours to understand your space, the type of markets and what you need.' },
      { n: '02', t: 'SETUP', b: "We build your space profile together — name, GPS location, description, market types, annual calendar. The WAM team handles everything." },
      { n: '03', t: 'MAKERS', b: 'The makers who operate at your space register independently and check in when they arrive. The space activates automatically whenever a market is running.' },
      { n: '04', t: 'VISIBILITY', b: 'The space appears on the map, in the calendar and in searches. Visitors discover it in real time. Monthly reports show the impact.' },
    ],
    sp1label: 'For parish councils',
    sp1title: ['YOUR', 'NEIGHBOURHOOD.', 'VISIBLE', 'TO THE WORLD.'],
    sp1body: 'The parish council manages the public space. WEAREMAKERS.PT makes it visible internationally. A partnership that values the local creative ecosystem and positions the neighbourhood as an authentic cultural tourism destination.',
    sp1list: ['Official parish profile with all spaces and markets', 'Visibility in 6 languages for international visitors', 'Public calendar of all markets in the parish', 'Impact reports to communicate to the parish assembly', 'Editorial feature in Neighborhood Loops — permanent SEO content', 'Local makers are associated with the parish profile'],
    sp1cta: 'CONTACT THE WAM TEAM →', sp1free: 'Partnership at no cost · No technical red tape · Ongoing support',
    sp1email: 'juntas@wearemakers.pt',
    sp2label: 'For private spaces',
    sp2title: ['YOUR', 'SPACE.', 'LIVE.'],
    sp2body: 'You have a space that hosts makers — regularly or occasionally. WEAREMAKERS.PT turns every market into an event visible to the whole city. Visitors come to you. Makers get more audience.',
    sp2list: ["Space profile on Lisbon's interactive map", 'Automatic activation whenever a market is running', 'Public calendar of events and markets at the space', 'Visibility in 6 languages with no additional effort', 'Makers who operate at the space are linked to its profile', 'Monthly visibility and digital impact reports'],
    sp2cta: 'REGISTER MY SPACE →', sp2free: 'Joint setup · No cost to the space · WAM team support',
    sp2email: 'espacos@wearemakers.pt',
    impEyebrow: 'THE IMPACT IN NUMBERS',
    impTitle: ["WHY IT'S", 'WORTH IT.', ''],
    impSub: "Lisbon is one of Europe's most visited cities. Cultural tourism is the fastest-growing segment. Independent maker street markets are exactly what visitors are looking for — and can't find.",
    imp: [
      { n: '6M+', l: 'Tourists visit Lisbon per year — seeking authentic experiences' },
      { n: '78%', l: 'Of active travellers prefer local and authentic experiences over traditional tourist attractions' },
      { n: '0€', l: 'Cost to the partner space — no fees, no commissions' },
    ],
    faqEyebrow: 'FREQUENTLY ASKED QUESTIONS',
    faqTitle: ['QUESTIONS', '& ANSWERS.'],
    faq: [
      { q: 'DOES OUR SPACE NEED TO BE A PARISH COUNCIL?', a: "No. WEAREMAKERS.PT works with any type of space that hosts independent makers — public or private. What matters is that the space is a place where makers sell their work." },
      { q: 'HOW MUCH DOES THE PARTNERSHIP COST?', a: "Nothing. The partnership is free for the space. No membership fees, no sales commissions, no monthly charges. The model works because it benefits the whole chain." },
      { q: 'DO THE MAKERS NEED TO REGISTER TOO?', a: "Yes — but that's the makers' responsibility, not the space's. The partner space is listed on the platform. Makers register independently and check in when they arrive." },
      { q: 'WHAT HAPPENS IF A MARKET IS CANCELLED?', a: "The market curator updates the status and visitors are automatically notified. The space doesn't need to do anything — the system handles communication." },
      { q: 'OUR SPACE ONLY HAS OCCASIONAL MARKETS. IS IT WORTH IT?', a: 'Yes. The space profile remains permanently visible even when there are no active markets. A space with two markets a month has exactly the same profile as one that runs every week.' },
      { q: 'HOW DOES VISITOR DATA APPEAR IN THE REPORTS?', a: 'Monthly reports show page visits, active makers, markets held and reach by language — without individual visitor personal data. They are aggregated impact reports.' },
    ],
    ftaEyebrow: 'LISBON · WE ARE MAKERS · PARTNER SPACES',
    ftaTitle: ['YOUR SPACE', 'ON THE MAP.', 'NOW.'],
    ftaTitleEm: [false, false, true],
    ftaCta1: 'REGISTER MY SPACE →', ftaCta2: "I'M A PARISH COUNCIL →",
    ftaSub: 'Partnership at no cost · No technical red tape · Set up in less than a week',
  },
}

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const C = {
  paper: '#F0EBE1', paper2: '#E6DFD3', paper3: '#D4CAB8',
  ink: '#111009', ink2: '#2A2820', ink3: '#4A4840', ink4: '#7A7870',
  red: '#E8341A', white: '#FFFFFF',
}

export default function EspacosPage() {
  const [lang, setLang] = useState<Lang>('pt')
  const t = T[lang]

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '16px', lineHeight: 1.6, background: C.ink, color: C.paper, overflowX: 'hidden' }}>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.055, backgroundImage: GRAIN }} />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: C.ink, borderBottom: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', color: C.red, textTransform: 'uppercase', letterSpacing: '-0.01em', textDecoration: 'none' }}>
            WEAREMAKERS<span style={{ color: C.paper }}>.PT</span>
          </Link>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: GOLD, letterSpacing: '0.18em', textTransform: 'uppercase', border: `1px solid ${GOLD}`, padding: '3px 8px' }}>{t.navBadge}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a href="#para-quem" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navWho}</a>
          <a href="#beneficios" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navBen}</a>
          <a href="#como" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.navHow}</a>
          <div style={{ display: 'flex', gap: '0', border: `1px solid ${C.ink3}` }}>
            {(['pt', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px', background: lang === l ? GOLD : 'transparent', color: lang === l ? C.white : C.ink4, border: 'none', cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href={`mailto:espacos@wearemakers.pt`} style={{ background: GOLD, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 20px', textDecoration: 'none' }}>
            {t.navCta}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', paddingTop: '60px', background: C.ink, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px 80px 88px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent calc(100%/12 - 1px),rgba(255,255,255,.018) calc(100%/12 - 1px),rgba(255,255,255,.018) calc(100%/12))', pointerEvents: 'none' }} />
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}} @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.24em', color: GOLD, textTransform: 'uppercase', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, display: 'inline-block', animation: 'blink 2.2s ease-in-out infinite' }} />
          {t.heroKicker}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,8vw,120px)', lineHeight: 0.88, textTransform: 'uppercase', color: C.paper, letterSpacing: '-0.02em', marginBottom: '48px', borderLeft: `5px solid ${GOLD}`, paddingLeft: '32px' }}>
          {t.heroH1.map((line, i) => (
            <span key={i} style={{ color: t.heroH1em[i] ? GOLD : C.paper, fontStyle: t.heroH1em[i] ? 'italic' : 'normal', display: 'block' }}>{line}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '18px', color: C.ink4, lineHeight: 1.75 }}>
            <p style={{ marginBottom: '16px' }}>{t.heroBody}</p>
            <p><strong style={{ color: C.paper }}>{t.heroBody2}</strong></p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href={`mailto:espacos@wearemakers.pt`} style={{ background: GOLD, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none' }}>{t.heroCta1}</a>
              <a href="#para-quem" style={{ border: `2px solid ${C.paper3}`, color: C.paper, fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '16px 32px', textDecoration: 'none' }}>{t.heroCta2}</a>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.heroSub}</div>
          </div>
        </div>
      </section>

      {/* ── TICKER (gold on ink) ── */}
      <div style={{ background: GOLD, height: '42px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'ticker 40s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri} style={{ display: 'flex' }}>
              {['6M TURISTAS', '200+ CRIADORES', '6 IDIOMAS', 'SEM CUSTOS', 'TEMPO REAL', 'RELATÓRIOS DE IMPACTO', 'AGENDA PÚBLICA', 'PERFIL NO MAPA'].map((item, i) => (
                <span key={i} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ink, padding: '0 32px', height: '42px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                  {item} <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,0,0,.3)', display: 'inline-block' }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: C.paper2, borderBottom: `1px solid ${C.paper3}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[{ n: t.stat1n, l: t.stat1l }, { n: t.stat2n, l: t.stat2l }, { n: t.stat3n, l: t.stat3l }, { n: t.stat4n, l: t.stat4l }].map((s, i) => (
          <div key={i} style={{ padding: '44px 52px', borderRight: i < 3 ? `1px solid ${C.paper3}` : 'none' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '60px', color: C.ink, lineHeight: 1, marginBottom: '8px' }}>
              <span style={{ color: GOLD }}>{s.n}</span>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.7 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── WHO ── */}
      <section id="para-quem" style={{ background: C.ink, padding: '120px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-end', marginBottom: '56px' }}>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <span style={{ width: '24px', height: '1px', background: GOLD, display: 'inline-block' }} /> {t.whoEyebrow}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,80px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.88 }}>
              {t.whoTitle.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.72 }}>{t.whoSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
          {t.wc.map((card, i) => (
            <div key={i} style={{ background: C.ink2, border: `1px solid ${C.ink3}`, borderTop: `3px solid ${GOLD}`, padding: '44px 38px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: GOLD, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '20px' }}>{card.num}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', color: C.paper, lineHeight: 1, marginBottom: '16px' }}>{card.name}</div>
              <p style={{ fontSize: '15px', color: C.ink4, lineHeight: 1.75, marginBottom: '24px' }}>{card.body}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {card.tags.map((tag, ti) => (
                  <span key={ti} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', border: `1px solid ${GOLD}`, padding: '4px 10px' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ background: C.paper, padding: '120px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,5vw,60px)', lineHeight: 0.92, textTransform: 'uppercase', color: C.ink, borderLeft: `4px solid ${GOLD}`, paddingLeft: '28px' }}>
          {t.probQ.map((line, i) => (
            <span key={i} style={{ color: t.probQem[i] ? GOLD : C.ink, fontStyle: t.probQem[i] ? 'italic' : 'normal', display: 'block' }}>{line}</span>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, marginBottom: '22px' }}>{t.probTitle}</div>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.78, marginBottom: '16px' }}>{t.probBody}</p>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.78, marginBottom: '32px' }}><strong style={{ color: C.ink }}>{t.probBody2}</strong></p>
          <div style={{ borderLeft: `3px solid ${GOLD}`, padding: '18px 22px', background: C.paper2, fontSize: '15px', color: C.ink3, lineHeight: 1.65, fontStyle: 'italic' }}>{t.probCallout}</div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="beneficios" style={{ background: C.ink2, padding: '120px 80px' }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ width: '24px', height: '1px', background: GOLD, display: 'inline-block' }} /> {t.benEyebrow}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,80px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.88, marginBottom: '20px' }}>
            {t.benTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink4, lineHeight: 1.7, maxWidth: '540px' }}>{t.benSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {t.ben.map((b, i) => (
            <div key={i} style={{ background: C.ink, border: `1px solid ${C.ink3}`, padding: '36px 32px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase', border: `1px solid ${GOLD}`, padding: '3px 8px', display: 'inline-block', marginBottom: '20px' }}>{b.tag}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', color: C.paper, lineHeight: 1, marginBottom: '14px' }}>{b.t}</div>
              <p style={{ fontSize: '14px', color: C.ink4, lineHeight: 1.78 }}>{b.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como" style={{ background: C.paper, padding: '120px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'flex-end', marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,80px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88 }}>
            {t.howTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.7 }}>{t.howSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2px' }}>
          {t.steps.map((s, i) => (
            <div key={i} style={{ background: C.paper2, border: `1px solid ${C.paper3}`, padding: '36px 28px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: GOLD, letterSpacing: '0.16em', textTransform: 'uppercase', border: `1px solid ${GOLD}`, padding: '3px 8px', display: 'inline-block', marginBottom: '20px' }}>{s.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, borderBottom: `2px solid ${GOLD}`, paddingBottom: '12px', display: 'inline-block', marginBottom: '16px' }}>{s.t}</div>
              <p style={{ fontSize: '14px', color: C.ink3, lineHeight: 1.75 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPLIT PARISHES (gold) ── */}
      <section style={{ background: GOLD, padding: '88px 80px' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: '20px' }}>{t.sp1label}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,5vw,64px)', textTransform: 'uppercase', lineHeight: 0.88, marginBottom: '24px', color: C.white }}>
          {t.sp1title.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <p style={{ fontSize: '17px', lineHeight: 1.72, marginBottom: '36px', color: 'rgba(255,255,255,.82)' }}>{t.sp1body}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', marginBottom: '36px' }}>
          {t.sp1list.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', lineHeight: 1.55, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,.2)', display: 'flex', gap: '12px', color: 'rgba(255,255,255,.78)' }}>
              <span style={{ color: 'rgba(255,255,255,.4)', flexShrink: 0 }}>—</span>{item}
            </li>
          ))}
        </ul>
        <a href={`mailto:${t.sp1email}`} style={{ background: C.ink, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none', display: 'inline-block' }}>{t.sp1cta}</a>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '14px', color: 'rgba(255,255,255,.5)' }}>{t.sp1free}</div>
      </section>

      {/* ── SPLIT PRIVATE (ink) ── */}
      <section style={{ background: C.ink, padding: '88px 80px', borderTop: `1px solid ${C.ink3}` }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.ink4, marginBottom: '20px' }}>{t.sp2label}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,5vw,64px)', textTransform: 'uppercase', lineHeight: 0.88, marginBottom: '24px', color: C.paper }}>
          {t.sp2title.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        <p style={{ fontSize: '17px', lineHeight: 1.72, marginBottom: '36px', color: C.ink4 }}>{t.sp2body}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', marginBottom: '36px' }}>
          {t.sp2list.map((item, i) => (
            <li key={i} style={{ fontSize: '14px', lineHeight: 1.55, padding: '11px 0', borderBottom: `1px solid ${C.ink3}`, display: 'flex', gap: '12px', color: C.ink4 }}>
              <span style={{ color: GOLD, flexShrink: 0 }}>—</span>{item}
            </li>
          ))}
        </ul>
        <a href={`mailto:${t.sp2email}`} style={{ background: GOLD, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none', display: 'inline-block' }}>{t.sp2cta}</a>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '14px', color: C.ink3 }}>{t.sp2free}</div>
      </section>

      {/* ── IMPACT ── */}
      <section style={{ background: C.paper2, padding: '120px 80px' }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ width: '24px', height: '1px', background: GOLD, display: 'inline-block' }} /> {t.impEyebrow}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,80px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88, marginBottom: '20px' }}>
            {t.impTitle.filter(Boolean).map((l, i) => <div key={i}>{l}</div>)}
          </div>
          <p style={{ fontSize: '17px', color: C.ink3, lineHeight: 1.7, maxWidth: '600px' }}>{t.impSub}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {t.imp.map((im, i) => (
            <div key={i} style={{ background: C.ink, padding: '52px 44px', border: `1px solid ${C.ink3}` }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,8vw,96px)', color: GOLD, lineHeight: 1, marginBottom: '16px' }}>{im.n}</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: C.ink4, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.7 }}>{im.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: C.paper, padding: '120px 80px' }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: C.red, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ width: '24px', height: '1px', background: C.red, display: 'inline-block' }} /> {t.faqEyebrow}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,6vw,80px)', textTransform: 'uppercase', color: C.ink, lineHeight: 0.88 }}>
            {t.faqTitle.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
          {t.faq.map((item, i) => (
            <div key={i} style={{ background: C.paper2, border: `1px solid ${C.paper3}`, padding: '32px 36px' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', color: C.ink, lineHeight: 1, marginBottom: '14px', paddingBottom: '14px', borderBottom: `2px solid ${GOLD}` }}>{item.q}</div>
              <p style={{ fontSize: '15px', color: C.ink3, lineHeight: 1.75 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ background: C.ink, borderTop: `3px solid ${GOLD}`, padding: '100px 80px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: GOLD, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '24px' }}>{t.ftaEyebrow}</div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(48px,7vw,112px)', textTransform: 'uppercase', color: C.paper, lineHeight: 0.87, marginBottom: '44px' }}>
          {t.ftaTitle.map((l, i) => (
            <div key={i} style={{ color: t.ftaTitleEm[i] ? GOLD : C.paper, fontStyle: t.ftaTitleEm[i] ? 'italic' : 'normal' }}>{l}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="mailto:espacos@wearemakers.pt" style={{ background: GOLD, color: C.white, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none' }}>{t.ftaCta1}</a>
          <a href="mailto:juntas@wearemakers.pt" style={{ border: `2px solid ${C.paper3}`, color: C.paper, fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '16px 32px', textDecoration: 'none' }}>{t.ftaCta2}</a>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t.ftaSub}</div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.ink2, borderTop: `1px solid ${C.ink3}`, padding: '52px 80px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '52px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', color: C.red, textTransform: 'uppercase', marginBottom: '4px' }}>WEAREMAKERS.PT</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>Para Espaços e Proprietários</div>
          <p style={{ fontSize: '14px', color: C.ink4, lineHeight: 1.7, maxWidth: '280px' }}>A plataforma em tempo real que liga espaços, criadores independentes e visitantes em Lisboa.</p>
        </div>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Espaços</div>
          {['Registar espaço privado', 'Parceria junta de freguesia', 'Como funciona', 'O que recebe'].map((l, i) => (
            <div key={i}><a href="mailto:espacos@wearemakers.pt" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{l}</a></div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: C.ink3, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Plataforma</div>
          {[{ l: 'Para criadores', h: '/pitch' }, { l: 'Abrir app', h: '/' }, { l: 'Contacto geral', h: 'mailto:info@wearemakers.pt' }].map((item, i) => (
            <div key={i}><a href={item.h} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: C.ink4, textDecoration: 'none', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{item.l}</a></div>
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
