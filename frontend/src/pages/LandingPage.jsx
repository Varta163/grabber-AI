import { useState, useEffect, useRef } from 'react'
import { Cpu } from 'lucide-react'

const TITLE = 'Grabber-AI'
const LETTERS = TITLE.split('')

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 5 + Math.random() * 90,
  y: 5 + Math.random() * 90,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
  color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6',
}))

const DATA_STREAMS = [
  'NEURAL NETWORK ACTIVE',
  'PROCESSING 14,832 SIGNALS',
  'INTELLIGENCE LAYER READY',
  'CONTEXT ENGINE ONLINE',
]

export default function LandingPage({ onSignIn, onSignUp }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [showStreams, setShowStreams] = useState(false)
  const [scanPos, setScanPos] = useState(0)
  const [streamIdx, setStreamIdx] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const timers = LETTERS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 300 + i * 110)
    )
    const subTimer = setTimeout(() => setShowSub(true), 300 + LETTERS.length * 110 + 250)
    const ctaTimer = setTimeout(() => setShowCta(true), 300 + LETTERS.length * 110 + 550)
    setTimeout(() => setShowStreams(true), 150)
    return () => { timers.forEach(clearTimeout); clearTimeout(subTimer); clearTimeout(ctaTimer) }
  }, [])

  useEffect(() => {
    let pos = 0
    const tick = () => {
      pos = pos > 100 ? 0 : pos + 0.35
      setScanPos(pos)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setStreamIdx(i => (i + 1) % DATA_STREAMS.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── Ambient glow ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 45% 45% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 65%)',
      }} />

      {/* ── Brain image (absolute background) ── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(500px, 80vw)',
        height: 'min(500px, 80vw)',
        zIndex: 1,
        pointerEvents: 'none',
      }}>
        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute', inset: '-6%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 70%)',
          animation: 'brainPulse 4s ease-in-out infinite',
        }} />
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: `${scanPos}%`, height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(139,92,246,0.6), transparent)',
          filter: 'blur(1px)',
          zIndex: 3,
        }} />
        <img
          src="/brain.jpg"
          alt="Neural AI Brain"
          style={{
            width: '100%', height: '100%',
            objectFit: 'contain',
            opacity: 0.55,
            filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.6)) drop-shadow(0 0 80px rgba(139,92,246,0.3))',
            animation: 'brainFloat 6s ease-in-out infinite',
            position: 'relative', zIndex: 2,
          }}
        />
        {/* Energy nodes */}
        {[
          { top: '10%', left: '20%' },
          { top: '15%', right: '18%' },
          { bottom: '22%', left: '10%' },
          { bottom: '20%', right: '12%' },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', ...pos,
            width: 8, height: 8, borderRadius: '50%',
            background: i % 2 === 0 ? '#3b82f6' : '#f59e0b',
            boxShadow: `0 0 12px ${i % 2 === 0 ? '#3b82f6' : '#f59e0b'}, 0 0 24px ${i % 2 === 0 ? '#3b82f6' : '#f59e0b'}`,
            animation: `nodePulse ${1.5 + i * 0.4}s ease-in-out infinite alternate`,
            zIndex: 4,
          }} />
        ))}
      </div>

      {/* ── Particles ── */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          opacity: 0.6, zIndex: 1, pointerEvents: 'none',
        }} />
      ))}

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        position: 'relative', zIndex: 20,
        borderBottom: '1px solid rgba(30,30,46,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(59,130,246,0.45)',
          }}>
            <Cpu size={16} color="#fff" />
          </div>
          <span style={{
            fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #93c5fd, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>GrabberAI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onSignIn} style={{
            background: 'transparent',
            border: '1px solid rgba(59,130,246,0.4)',
            borderRadius: '0.5rem', padding: '0.45rem 1.2rem',
            fontSize: '0.85rem', fontWeight: 500, color: '#93c5fd',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)' }}
          >Sign In</button>
          <button onClick={onSignUp} style={{
            background: 'linear-gradient(135deg, #3b82f6, #6d28d9)',
            border: 'none', borderRadius: '0.5rem', padding: '0.45rem 1.2rem',
            fontSize: '0.85rem', fontWeight: 600, color: '#fff',
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 0 14px rgba(59,130,246,0.35)',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(59,130,246,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(59,130,246,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >Sign Up</button>
        </div>
      </header>

      {/* ── Hero text (centered over brain) ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10,
        padding: '0 1.5rem',
      }}>

        {/* Data ticker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '2rem',
          opacity: showStreams ? 1 : 0,
          transition: 'opacity 0.6s ease',
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
          }}>{DATA_STREAMS[streamIdx]}</span>
        </div>

        {/* Animated letters */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          {LETTERS.map((letter, i) => {
            const visible = i < visibleCount
            return (
              <span key={i} style={{
                display: 'inline-block',
                fontSize: 'clamp(3rem, 9vw, 6rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(-28px) scale(0.75)',
                transition: 'opacity 0.4s cubic-bezier(.22,.68,0,1.2), transform 0.45s cubic-bezier(.22,.68,0,1.2)',
                background: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 35%, #8b5cf6 70%, #ddd6fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: visible ? 'drop-shadow(0 0 14px rgba(59,130,246,1))' : 'none',
                textShadow: 'none',
              }}>
                {letter}
              </span>
            )
          })}
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: '#64748b',
          letterSpacing: '0.06em',
          textAlign: 'center',
          maxWidth: 400,
          lineHeight: 1.7,
          marginBottom: '2.5rem',
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

        {/* Single CTA */}
        <button
          onClick={onSignUp}
          style={{
            opacity: showCta ? 1 : 0,
            transform: showCta ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s, translateY 0.2s',
            background: 'linear-gradient(135deg, #3b82f6, #6d28d9)',
            border: 'none', borderRadius: '0.75rem',
            padding: '0.9rem 2.5rem',
            fontSize: '0.95rem', fontWeight: 600, color: '#fff',
            cursor: 'pointer', letterSpacing: '0.04em',
            boxShadow: '0 0 28px rgba(59,130,246,0.5), 0 0 56px rgba(139,92,246,0.25)',
            animation: showCta ? 'ctaPulse 3s ease-in-out infinite' : 'none',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(59,130,246,0.75), 0 0 80px rgba(139,92,246,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(59,130,246,0.5), 0 0 56px rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Get Started — it's free
          <span style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            animation: 'shimmer 2.5s linear infinite',
            pointerEvents: 'none',
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
        backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
        maskImage: 'linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <style>{`
        @keyframes brainFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes brainPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0); opacity: 0.3; }
          100% { transform: translateY(-18px) translateX(8px); opacity: 0.8; }
        }
        @keyframes nodePulse {
          0% { opacity: 0.3; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 28px rgba(59,130,246,0.5), 0 0 56px rgba(139,92,246,0.25); }
          50% { box-shadow: 0 0 38px rgba(59,130,246,0.7), 0 0 76px rgba(139,92,246,0.4); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        @keyframes streamFade {
          0%, 100% { opacity: 0.4; }
          15%, 85% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
