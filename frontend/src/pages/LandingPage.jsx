import { useState, useEffect, useRef } from 'react'
import { Cpu } from 'lucide-react'

// ── Brain canvas — side-profile with gyri, swirling energy lines & glow ─────
function BrainCanvas({ size }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const s = size / 400

    // ── Brain side-profile path (facing left) ──
    function makeBrainPath() {
      const p = new Path2D()
      p.moveTo(152 * s, 82 * s)
      // Frontal lobe — front curve
      p.bezierCurveTo(118 * s, 75 * s, 85 * s, 88 * s, 68 * s, 118 * s)
      p.bezierCurveTo(52 * s, 148 * s, 52 * s, 185 * s, 65 * s, 215 * s)
      // Temporal lobe — bottom
      p.bezierCurveTo(80 * s, 240 * s, 105 * s, 262 * s, 135 * s, 272 * s)
      p.bezierCurveTo(162 * s, 281 * s, 192 * s, 282 * s, 218 * s, 273 * s)
      p.bezierCurveTo(242 * s, 265 * s, 258 * s, 248 * s, 264 * s, 228 * s)
      // Cerebellum notch
      p.bezierCurveTo(267 * s, 215 * s, 275 * s, 208 * s, 288 * s, 208 * s)
      // Cerebellum outer
      p.bezierCurveTo(308 * s, 208 * s, 330 * s, 218 * s, 338 * s, 238 * s)
      p.bezierCurveTo(346 * s, 258 * s, 338 * s, 280 * s, 320 * s, 288 * s)
      p.bezierCurveTo(302 * s, 296 * s, 280 * s, 288 * s, 270 * s, 272 * s)
      // Brain stem
      p.bezierCurveTo(260 * s, 258 * s, 254 * s, 268 * s, 251 * s, 285 * s)
      p.bezierCurveTo(248 * s, 302 * s, 251 * s, 322 * s, 257 * s, 338 * s)
      p.lineTo(260 * s, 348 * s)
      p.lineTo(245 * s, 350 * s)
      p.lineTo(241 * s, 338 * s)
      p.bezierCurveTo(236 * s, 320 * s, 235 * s, 300 * s, 238 * s, 282 * s)
      p.bezierCurveTo(242 * s, 265 * s, 235 * s, 252 * s, 225 * s, 246 * s)
      // Occipital lobe — back
      p.bezierCurveTo(245 * s, 232 * s, 255 * s, 210 * s, 252 * s, 185 * s)
      p.bezierCurveTo(250 * s, 160 * s, 238 * s, 135 * s, 222 * s, 115 * s)
      // Parietal lobe — top-right
      p.bezierCurveTo(208 * s, 95 * s, 188 * s, 80 * s, 168 * s, 76 * s)
      p.bezierCurveTo(162 * s, 74 * s, 156 * s, 76 * s, 152 * s, 82 * s)
      p.closePath()
      return p
    }

    // ── Gyri (brain fold lines) — follow contour of brain ──
    const GYRI = [
      // Frontal lobe folds (roughly vertical)
      [[78, 125], [76, 158], [80, 192], [90, 222]],
      [[96, 108], [94, 142], [98, 175], [110, 208]],
      [[115, 95], [113, 130], [117, 163], [128, 196]],
      [[135, 87], [133, 122], [137, 155], [148, 188]],
      // Parietal folds (arc over top)
      [[158, 80], [188, 74], [218, 76], [242, 88]],
      [[155, 98], [185, 92], [216, 94], [238, 106]],
      [[150, 116], [180, 110], [212, 112], [234, 124]],
      // Temporal folds (sweep along bottom)
      [[92, 248], [125, 262], [158, 268], [192, 266]],
      [[100, 232], [132, 246], [164, 252], [196, 250]],
      [[112, 216], [142, 230], [172, 236], [200, 234]],
      // Occipital folds (back curves)
      [[248, 158], [252, 180], [250, 205], [244, 228]],
      [[232, 138], [238, 162], [238, 188], [233, 212]],
      [[215, 120], [222, 146], [222, 172], [218, 198]],
      // Cerebellum folds
      [[288, 218], [305, 222], [318, 235], [322, 255]],
      [[285, 232], [300, 238], [310, 252], [306, 268]],
    ]

    // ── Swirling energy lines ──
    const rng = (a, b) => a + Math.random() * (b - a)
    const SWIRLS = Array.from({ length: 38 }, (_, i) => {
      const ang = (i / 38) * Math.PI * 2 + rng(-0.3, 0.3)
      const bx = 180 + rng(-55, 55)
      const by = 185 + rng(-60, 60)
      const r1 = rng(100, 160)
      const r2 = rng(140, 220)
      const sweep = rng(0.9, 2.2) * (Math.random() > 0.5 ? 1 : -1)
      return {
        x0: bx, y0: by,
        cp1x: bx + Math.cos(ang) * r1,
        cp1y: by + Math.sin(ang) * r1 * 0.75,
        cp2x: bx + Math.cos(ang + sweep * 0.6) * r2,
        cp2y: by + Math.sin(ang + sweep * 0.6) * r2 * 0.75,
        x1: bx + Math.cos(ang + sweep) * r1 * 0.9,
        y1: by + Math.sin(ang + sweep) * r1 * 0.7,
        phase: rng(0, Math.PI * 2),
        speed: rng(0.15, 0.5),
        color: Math.random() > 0.3 ? '100,170,255' : '180,140,255',
      }
    })

    // ── Energy nodes (orange = hot, blue = cool) ──
    const NODES = [
      { x: 148, y: 128, c: '255,185,50',  r: 5.5, phase: 0.0 },
      { x: 188, y: 90,  c: '255,200,60',  r: 4.5, phase: 1.1 },
      { x: 228, y: 110, c: '255,175,45',  r: 5.0, phase: 2.2 },
      { x: 248, y: 152, c: '255,185,50',  r: 4.0, phase: 0.7 },
      { x: 252, y: 198, c: '255,160,30',  r: 6.0, phase: 1.8 },
      { x: 208, y: 240, c: '255,185,50',  r: 4.5, phase: 3.1 },
      { x: 155, y: 252, c: '255,175,45',  r: 4.0, phase: 0.4 },
      { x: 98,  y: 212, c: '255,185,50',  r: 4.0, phase: 2.5 },
      { x: 72,  y: 168, c: '255,200,60',  r: 3.5, phase: 1.3 },
      { x: 165, y: 148, c: '255,175,45',  r: 5.0, phase: 0.9 },
      { x: 308, y: 248, c: '255,185,50',  r: 5.0, phase: 2.0 },
      // Blue nodes
      { x: 178, y: 108, c: '140,200,255', r: 3.0, phase: 1.6 },
      { x: 212, y: 128, c: '160,210,255', r: 3.0, phase: 2.8 },
      { x: 238, y: 172, c: '140,200,255', r: 3.0, phase: 0.3 },
      { x: 230, y: 218, c: '160,210,255', r: 3.0, phase: 1.5 },
      { x: 175, y: 230, c: '140,200,255', r: 2.8, phase: 3.0 },
      { x: 125, y: 218, c: '160,210,255', r: 2.8, phase: 0.8 },
      { x: 108, y: 172, c: '140,200,255', r: 2.8, phase: 2.1 },
      { x: 125, y: 132, c: '160,210,255', r: 2.8, phase: 1.2 },
      { x: 325, y: 258, c: '140,200,255', r: 2.5, phase: 0.6 },
    ]

    const brainPath = makeBrainPath()
    let id

    const draw = (ts) => {
      const t = ts / 1000
      ctx.clearRect(0, 0, size, size)
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.65)

      // ── Outer background glow ──
      const bgG = ctx.createRadialGradient(185*s,188*s,0, 185*s,188*s,210*s)
      bgG.addColorStop(0, `rgba(18,38,130,${0.28+pulse*0.08})`)
      bgG.addColorStop(0.55, `rgba(8,18,70,0.18)`)
      bgG.addColorStop(1, 'transparent')
      ctx.fillStyle = bgG
      ctx.fillRect(0, 0, size, size)

      // ── Swirling energy lines (draw behind brain) ──
      SWIRLS.forEach(sw => {
        const a = 0.025 + 0.018 * Math.sin(t * sw.speed + sw.phase)
        ctx.save()
        ctx.shadowBlur = 10 * s
        ctx.shadowColor = `rgba(${sw.color},0.6)`
        ctx.beginPath()
        ctx.moveTo(sw.x0*s, sw.y0*s)
        ctx.bezierCurveTo(sw.cp1x*s,sw.cp1y*s, sw.cp2x*s,sw.cp2y*s, sw.x1*s,sw.y1*s)
        ctx.strokeStyle = `rgba(${sw.color},${a})`
        ctx.lineWidth = 0.9 * s
        ctx.stroke()
        ctx.restore()
      })

      // ── Brain fill (clipped inside outline) ──
      ctx.save()
      ctx.clip(brainPath)

      const fill = ctx.createRadialGradient(178*s,172*s,5*s, 178*s,172*s,210*s)
      fill.addColorStop(0,   `rgba(30,65,175,${0.72+pulse*0.08})`)
      fill.addColorStop(0.45,`rgba(18,40,120,0.78)`)
      fill.addColorStop(1,   `rgba(8,16,55,0.85)`)
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, size, size)

      // ── Gyri fold lines (inside clip) ──
      GYRI.forEach((pts, i) => {
        const a = 0.22 + 0.08 * Math.sin(t * 0.25 + i * 0.5)
        ctx.save()
        ctx.shadowBlur = 5 * s
        ctx.shadowColor = `rgba(80,150,255,0.5)`
        ctx.beginPath()
        ctx.moveTo(pts[0][0]*s, pts[0][1]*s)
        ctx.bezierCurveTo(
          pts[1][0]*s, pts[1][1]*s,
          pts[2][0]*s, pts[2][1]*s,
          pts[3][0]*s, pts[3][1]*s
        )
        ctx.strokeStyle = `rgba(90,155,255,${a})`
        ctx.lineWidth = 1.4 * s
        ctx.stroke()
        ctx.restore()
      })

      ctx.restore() // end clip

      // ── Brain outline — multi-pass glow ──
      // Wide soft glow
      ctx.save()
      ctx.shadowBlur = 45 * s
      ctx.shadowColor = `rgba(50,120,255,${0.55+pulse*0.3})`
      ctx.strokeStyle = `rgba(80,160,255,${0.15+pulse*0.08})`
      ctx.lineWidth = 8 * s
      ctx.stroke(brainPath)
      ctx.restore()
      // Crisp bright outline
      ctx.save()
      ctx.shadowBlur = 18 * s
      ctx.shadowColor = `rgba(120,190,255,${0.8+pulse*0.2})`
      ctx.strokeStyle = `rgba(140,200,255,${0.6+pulse*0.3})`
      ctx.lineWidth = 1.8 * s
      ctx.stroke(brainPath)
      ctx.restore()

      // ── Energy nodes ──
      NODES.forEach(n => {
        const p = 0.5 + 0.5 * Math.sin(t * 1.8 + n.phase)
        const r = n.r * s
        ctx.save()
        ctx.shadowBlur = 20 * s
        ctx.shadowColor = `rgba(${n.c},0.9)`
        const ng = ctx.createRadialGradient(n.x*s,n.y*s,0, n.x*s,n.y*s,r*5.5)
        ng.addColorStop(0, `rgba(${n.c},${0.7+p*0.3})`)
        ng.addColorStop(0.4, `rgba(${n.c},${0.2+p*0.15})`)
        ng.addColorStop(1, 'transparent')
        ctx.fillStyle = ng
        ctx.beginPath()
        ctx.arc(n.x*s, n.y*s, r*5.5, 0, Math.PI*2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x*s, n.y*s, r*(0.55+p*0.45), 0, Math.PI*2)
        ctx.fillStyle = `rgba(${n.c},1)`
        ctx.fill()
        ctx.restore()
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

  const brainSize = Math.min(460, typeof window !== 'undefined' ? window.innerWidth * 0.82 : 400)

  return (
    <div style={{
      height: '100vh', background: '#060610',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(30,80,200,0.13) 0%, transparent 70%)',
      }} />

      {/* Brain canvas centred */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1, pointerEvents: 'none',
        animation: 'brainFloat 7s ease-in-out infinite',
      }}>
        <BrainCanvas size={brainSize} />
      </div>

      {/* Ambient particles */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `floatP ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          opacity: 0.45, zIndex: 1, pointerEvents: 'none',
        }} />
      ))}

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem', position: 'relative', zIndex: 20,
        borderBottom: '1px solid rgba(30,30,60,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59,130,246,0.5)',
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

      {/* ── Hero text ── */}
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
        @keyframes brainFloat { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-12px)} }
        @keyframes floatP { 0%{transform:translateY(0) translateX(0);opacity:.3} 100%{transform:translateY(-18px) translateX(8px);opacity:.8} }
        @keyframes nodePulse { 0%{opacity:.3;transform:scale(.7)} 100%{opacity:1;transform:scale(1.4)} }
        @keyframes ctaPulse { 0%,100%{box-shadow:0 0 28px rgba(59,130,246,.5),0 0 56px rgba(139,92,246,.25)} 50%{box-shadow:0 0 38px rgba(59,130,246,.7),0 0 76px rgba(139,92,246,.4)} }
        @keyframes shimmer { 0%{transform:translateX(-150%)} 100%{transform:translateX(150%)} }
        @keyframes streamFade { 0%,100%{opacity:.4} 15%,85%{opacity:1} }
      `}</style>
    </div>
  )
}
