import { useState, useEffect, useRef } from 'react'
import { Cpu } from 'lucide-react'

// ── Brain canvas animation ──────────────────────────────────────────────────
// Nodes distributed in a wide brain shape (cerebrum + cerebellum)
const RAW_NODES = [
  // Left hemisphere — top crown
  { x: 148, y: 90 }, { x: 175, y: 80 },
  // Left hemisphere — upper
  { x: 108, y: 118 }, { x: 140, y: 104 }, { x: 170, y: 97 },
  // Left hemisphere — upper-mid
  { x: 84, y: 150 }, { x: 116, y: 134 }, { x: 148, y: 124 }, { x: 178, y: 118 },
  // Left hemisphere — mid
  { x: 76, y: 182 }, { x: 108, y: 166 }, { x: 140, y: 156 }, { x: 172, y: 150 }, { x: 194, y: 148 },
  // Left hemisphere — lower-mid
  { x: 82, y: 214 }, { x: 113, y: 200 }, { x: 144, y: 190 }, { x: 174, y: 184 }, { x: 194, y: 182 },
  // Left hemisphere — lower
  { x: 98, y: 242 }, { x: 128, y: 230 }, { x: 158, y: 222 }, { x: 186, y: 217 },
  // Left hemisphere — bottom
  { x: 120, y: 262 }, { x: 152, y: 255 }, { x: 180, y: 250 },

  // Right hemisphere — top crown (mirror)
  { x: 225, y: 80 }, { x: 252, y: 90 },
  // Right hemisphere — upper
  { x: 230, y: 97 }, { x: 260, y: 104 }, { x: 292, y: 118 },
  // Right hemisphere — upper-mid
  { x: 222, y: 118 }, { x: 252, y: 124 }, { x: 284, y: 134 }, { x: 316, y: 150 },
  // Right hemisphere — mid
  { x: 206, y: 148 }, { x: 228, y: 150 }, { x: 260, y: 156 }, { x: 292, y: 166 }, { x: 324, y: 182 },
  // Right hemisphere — lower-mid
  { x: 206, y: 182 }, { x: 226, y: 184 }, { x: 256, y: 190 }, { x: 287, y: 200 }, { x: 318, y: 214 },
  // Right hemisphere — lower
  { x: 214, y: 217 }, { x: 242, y: 222 }, { x: 272, y: 230 }, { x: 302, y: 242 },
  // Right hemisphere — bottom
  { x: 220, y: 250 }, { x: 248, y: 255 }, { x: 280, y: 262 },

  // Cerebellum
  { x: 165, y: 278 }, { x: 188, y: 285 }, { x: 200, y: 288 }, { x: 212, y: 285 }, { x: 235, y: 278 },
  { x: 182, y: 302 }, { x: 200, y: 307 }, { x: 218, y: 302 },
]
// Orange energy nodes: corners + cerebellum center
const ORANGE_IDX = new Set([1, 26, 9, 35, 47, 21, 42])

function brainOutlinePath(ctx, s) {
  ctx.beginPath()
  ctx.moveTo(200 * s, 70 * s)
  // Left arc: top → left side → bottom-left
  ctx.bezierCurveTo(176 * s, 65 * s, 144 * s, 70 * s, 118 * s, 88 * s)
  ctx.bezierCurveTo(92 * s, 106 * s, 74 * s, 134 * s, 70 * s, 165 * s)
  ctx.bezierCurveTo(66 * s, 196 * s, 78 * s, 228 * s, 100 * s, 250 * s)
  ctx.bezierCurveTo(118 * s, 267 * s, 144 * s, 274 * s, 164 * s, 273 * s)
  // Cerebellum left bump
  ctx.bezierCurveTo(172 * s, 272 * s, 176 * s, 280 * s, 174 * s, 293 * s)
  ctx.bezierCurveTo(172 * s, 307 * s, 183 * s, 318 * s, 195 * s, 320 * s)
  ctx.lineTo(200 * s, 321 * s)
  ctx.lineTo(205 * s, 320 * s)
  // Cerebellum right bump
  ctx.bezierCurveTo(217 * s, 318 * s, 228 * s, 307 * s, 226 * s, 293 * s)
  ctx.bezierCurveTo(224 * s, 280 * s, 228 * s, 272 * s, 236 * s, 273 * s)
  // Right arc: bottom-right → right side → top
  ctx.bezierCurveTo(256 * s, 274 * s, 282 * s, 267 * s, 300 * s, 250 * s)
  ctx.bezierCurveTo(322 * s, 228 * s, 334 * s, 196 * s, 330 * s, 165 * s)
  ctx.bezierCurveTo(326 * s, 134 * s, 308 * s, 106 * s, 282 * s, 88 * s)
  ctx.bezierCurveTo(256 * s, 70 * s, 224 * s, 65 * s, 200 * s, 70 * s)
  ctx.closePath()
}

function BrainCanvas({ size }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const s = size / 400

    const nodes = RAW_NODES.map(n => ({ x: n.x * s, y: n.y * s }))

    const conns = []
    const maxD = 78 * s
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        if (Math.sqrt(dx * dx + dy * dy) < maxD) conns.push([i, j])
      }
    }

    const parts = conns.map((_, i) => ({
      conn: conns[i],
      t: i / conns.length,
      speed: 0.0015 + Math.random() * 0.002,
    }))

    const phases = nodes.map(() => Math.random() * Math.PI * 2)
    let id

    const draw = (ts) => {
      const t = ts / 1000
      ctx.clearRect(0, 0, size, size)

      const pulse = 0.5 + 0.5 * Math.sin(t * 0.7)

      // ── Brain silhouette fill ──
      brainOutlinePath(ctx, s)
      const bg = ctx.createRadialGradient(200*s, 185*s, 0, 200*s, 185*s, 160*s)
      bg.addColorStop(0, `rgba(14,28,80,${0.55 + pulse * 0.08})`)
      bg.addColorStop(0.6, `rgba(8,16,52,${0.38})`)
      bg.addColorStop(1, 'rgba(4,8,30,0.15)')
      ctx.fillStyle = bg
      ctx.fill()

      // ── Brain outline glow ──
      ctx.save()
      ctx.shadowBlur = 18 * s
      ctx.shadowColor = `rgba(59,130,246,${0.45 + pulse * 0.25})`
      brainOutlinePath(ctx, s)
      ctx.strokeStyle = `rgba(59,130,246,${0.35 + pulse * 0.2})`
      ctx.lineWidth = 1.8 * s
      ctx.stroke()
      ctx.restore()

      // ── Longitudinal fissure (centre groove) ──
      ctx.save()
      ctx.strokeStyle = `rgba(20,50,120,0.6)`
      ctx.lineWidth = 1.2 * s
      ctx.beginPath()
      ctx.moveTo(200 * s, 70 * s)
      ctx.bezierCurveTo(198 * s, 130 * s, 197 * s, 175 * s, 199 * s, 215 * s)
      ctx.stroke()
      ctx.restore()

      // ── Sulci (brain groove lines) ──
      ctx.save()
      ctx.strokeStyle = 'rgba(40,80,180,0.22)'
      ctx.lineWidth = 1.0 * s
      // Left hemisphere sulci
      const leftSulci = [
        [[115,105],[122,135],[112,165]],
        [[155,92],[150,125],[144,158],[135,188]],
        [[82,198],[112,208],[145,212],[174,210]],
      ]
      leftSulci.forEach(pts => {
        ctx.beginPath()
        ctx.moveTo(pts[0][0]*s, pts[0][1]*s)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0]*s, pts[i][1]*s)
        ctx.stroke()
      })
      // Right hemisphere sulci (mirror)
      const rightSulci = [
        [[285,105],[278,135],[288,165]],
        [[245,92],[250,125],[256,158],[265,188]],
        [[318,198],[288,208],[255,212],[226,210]],
      ]
      rightSulci.forEach(pts => {
        ctx.beginPath()
        ctx.moveTo(pts[0][0]*s, pts[0][1]*s)
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0]*s, pts[i][1]*s)
        ctx.stroke()
      })
      ctx.restore()

      // ── Neural connections ──
      conns.forEach(([a, b]) => {
        const alpha = 0.07 + 0.05 * Math.sin(t * 0.4 + a)
        ctx.beginPath()
        ctx.moveTo(nodes[a].x, nodes[a].y)
        ctx.lineTo(nodes[b].x, nodes[b].y)
        ctx.strokeStyle = `rgba(110,170,255,${alpha})`
        ctx.lineWidth = 0.8 * s
        ctx.stroke()
      })

      // ── Travelling particles ──
      parts.forEach(p => {
        p.t += p.speed
        if (p.t > 1) p.t = 0
        const [ai, bi] = p.conn
        const px = nodes[ai].x + (nodes[bi].x - nodes[ai].x) * p.t
        const py = nodes[ai].y + (nodes[bi].y - nodes[ai].y) * p.t
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 5 * s)
        pg.addColorStop(0, 'rgba(190,220,255,0.95)')
        pg.addColorStop(1, 'transparent')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py, 5 * s, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px, py, 1.6 * s, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(235,245,255,0.98)'
        ctx.fill()
      })

      // ── Nodes ──
      nodes.forEach((n, i) => {
        const isOrange = ORANGE_IDX.has(i)
        const p = 0.5 + 0.5 * Math.sin(t * 1.6 + phases[i])
        const rgb = isOrange ? '245,158,11' : '80,160,255'
        const r = (isOrange ? 5.5 : 3.2) * s
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5)
        ng.addColorStop(0, `rgba(${rgb},${0.6 + p * 0.35})`)
        ng.addColorStop(1, 'transparent')
        ctx.fillStyle = ng
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * (0.65 + p * 0.35), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${0.85 + p * 0.15})`
        ctx.fill()
      })

      id = requestAnimationFrame(draw)
    }

    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [size])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block' }} />
}

// ── Landing page ────────────────────────────────────────────────────────────
const LETTERS = 'Grabber-AI'.split('')

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 5 + Math.random() * 90,
  y: 5 + Math.random() * 90,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
  color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6',
}))

const STREAMS = [
  'NEURAL NETWORK ACTIVE',
  'PROCESSING 14,832 SIGNALS',
  'INTELLIGENCE LAYER READY',
  'CONTEXT ENGINE ONLINE',
]

export default function LandingPage({ onSignIn, onSignUp }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [showTicker, setShowTicker] = useState(false)
  const [streamIdx, setStreamIdx] = useState(0)

  useEffect(() => {
    const timers = LETTERS.map((_, i) => setTimeout(() => setVisibleCount(i + 1), 300 + i * 110))
    const t1 = setTimeout(() => setShowSub(true), 300 + LETTERS.length * 110 + 250)
    const t2 = setTimeout(() => setShowCta(true), 300 + LETTERS.length * 110 + 550)
    setTimeout(() => setShowTicker(true), 150)
    return () => { timers.forEach(clearTimeout); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setStreamIdx(i => (i + 1) % STREAMS.length), 2200)
    return () => clearInterval(id)
  }, [])

  const brainSize = Math.min(420, typeof window !== 'undefined' ? window.innerWidth * 0.75 : 380)

  return (
    <div style={{
      height: '100vh', background: '#0a0a0f',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,0.11) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 40% 40% at 50% 52%, rgba(139,92,246,0.07) 0%, transparent 65%)',
      }} />

      {/* Brain canvas (absolute centre) */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1, pointerEvents: 'none',
        animation: 'brainFloat 6s ease-in-out infinite',
        filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.35)) drop-shadow(0 0 80px rgba(139,92,246,0.2))',
      }}>
        <BrainCanvas size={brainSize} />
      </div>

      {/* Particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `floatP ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          opacity: 0.55, zIndex: 1, pointerEvents: 'none',
        }} />
      ))}

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem', position: 'relative', zIndex: 20,
        borderBottom: '1px solid rgba(30,30,46,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59,130,246,0.45)',
          }}>
            <Cpu size={16} color="#fff" />
          </div>
          <span style={{
            fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg,#93c5fd,#8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>GrabberAI</span>
        </div>

        <button onClick={onSignIn} style={{
          background: 'transparent', border: '1px solid rgba(59,130,246,0.4)',
          borderRadius: '0.5rem', padding: '0.45rem 1.4rem',
          fontSize: '0.875rem', fontWeight: 500, color: '#93c5fd',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)' }}
        >Sign In</button>
      </header>

      {/* ── Hero text (over brain) ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10, padding: '0 1.5rem',
      }}>
        {/* Ticker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1.75rem',
          opacity: showTicker ? 1 : 0, transition: 'opacity 0.6s',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10b981', boxShadow: '0 0 8px #10b981',
            animation: 'nodePulse 1s ease-in-out infinite alternate',
          }} />
          <span style={{
            fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
            color: '#475569', letterSpacing: '0.12em',
            animation: 'streamFade 2.2s ease-in-out infinite',
          }}>{STREAMS[streamIdx]}</span>
        </div>

        {/* Animated letters */}
        <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
          {LETTERS.map((letter, i) => (
            <span key={i} style={{
              display: 'inline-block',
              fontSize: 'clamp(3rem, 9vw, 6rem)',
              fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1,
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? 'translateY(0) scale(1)' : 'translateY(-28px) scale(0.75)',
              transition: 'opacity 0.4s cubic-bezier(.22,.68,0,1.2), transform 0.45s cubic-bezier(.22,.68,0,1.2)',
              background: 'linear-gradient(135deg,#bfdbfe 0%,#3b82f6 35%,#8b5cf6 70%,#ddd6fe 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: i < visibleCount ? 'drop-shadow(0 0 16px rgba(59,130,246,1))' : 'none',
            }}>{letter}</span>
          ))}
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.85rem,2vw,1rem)', color: '#64748b',
          letterSpacing: '0.06em', textAlign: 'center',
          maxWidth: 400, lineHeight: 1.7, marginBottom: '2.5rem',
          opacity: showSub ? 1 : 0,
          transform: showSub ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          Tech intelligence, distilled in real-time.
          <br />
          <span style={{ color: '#334155', fontSize: '0.88em' }}>
            AI-powered signals from the world's top sources.
          </span>
        </p>

        {/* CTA */}
        <button onClick={onSignUp} style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          background: 'linear-gradient(135deg,#3b82f6,#6d28d9)', border: 'none',
          borderRadius: '0.75rem', padding: '0.9rem 2.5rem',
          fontSize: '0.95rem', fontWeight: 600, color: '#fff',
          cursor: 'pointer', letterSpacing: '0.04em',
          boxShadow: '0 0 28px rgba(59,130,246,0.5), 0 0 56px rgba(139,92,246,0.25)',
          animation: showCta ? 'ctaPulse 3s ease-in-out infinite' : 'none',
          position: 'relative', overflow: 'hidden',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 42px rgba(59,130,246,0.75), 0 0 80px rgba(139,92,246,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(59,130,246,0.5), 0 0 56px rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Get Started — it's free
          <span style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)',
            animation: 'shimmer 2.5s linear infinite', pointerEvents: 'none',
          }} />
        </button>

        <p style={{
          marginTop: '1rem', fontSize: '0.8rem', color: '#334155',
          opacity: showCta ? 1 : 0, transition: 'opacity 0.5s ease 0.2s',
        }}>
          Already have an account?{' '}
          <button onClick={onSignIn} style={{
            background: 'none', border: 'none', color: '#3b82f6',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
            textDecoration: 'underline', padding: 0,
          }}>Sign in</button>
        </p>
      </div>

      {/* Bottom grid */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
        backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)`,
        backgroundSize: '40px 40px',
        WebkitMaskImage: 'linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 100%)',
        maskImage: 'linear-gradient(0deg,rgba(0,0,0,0.35) 0%,transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <style>{`
        @keyframes brainFloat { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-14px)} }
        @keyframes floatP { 0%{transform:translateY(0) translateX(0);opacity:.3} 100%{transform:translateY(-18px) translateX(8px);opacity:.8} }
        @keyframes nodePulse { 0%{opacity:.3;transform:scale(.7)} 100%{opacity:1;transform:scale(1.4)} }
        @keyframes ctaPulse { 0%,100%{box-shadow:0 0 28px rgba(59,130,246,.5),0 0 56px rgba(139,92,246,.25)} 50%{box-shadow:0 0 38px rgba(59,130,246,.7),0 0 76px rgba(139,92,246,.4)} }
        @keyframes shimmer { 0%{transform:translateX(-150%)} 100%{transform:translateX(150%)} }
        @keyframes streamFade { 0%,100%{opacity:.4} 15%,85%{opacity:1} }
      `}</style>
    </div>
  )
}
