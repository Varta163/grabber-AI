import { useState, useEffect, useRef } from 'react'

const TITLE = 'Grabber-AI'
const LETTERS = TITLE.split('')

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 5,
  color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6',
}))

const DATA_STREAMS = [
  'NEURAL NETWORK ACTIVE',
  'PROCESSING 14,832 SIGNALS',
  'INTELLIGENCE LAYER READY',
  'CONTEXT ENGINE ONLINE',
]

export default function LandingPage({ onEnter }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showSub, setShowSub] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [showStreams, setShowStreams] = useState(false)
  const [scanPos, setScanPos] = useState(-10)
  const [streamIdx, setStreamIdx] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  // Letter-by-letter reveal
  useEffect(() => {
    const delays = LETTERS.map((_, i) => 400 + i * 130)
    const timers = delays.map((delay, i) =>
      setTimeout(() => setVisibleCount(i + 1), delay)
    )
    const subTimer = setTimeout(() => setShowSub(true), 400 + LETTERS.length * 130 + 300)
    const ctaTimer = setTimeout(() => setShowCta(true), 400 + LETTERS.length * 130 + 700)
    const streamsTimer = setTimeout(() => setShowStreams(true), 200)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(subTimer)
      clearTimeout(ctaTimer)
      clearTimeout(streamsTimer)
    }
  }, [])

  // Scanning line animation
  useEffect(() => {
    let pos = -10
    const tick = () => {
      pos = pos > 110 ? -10 : pos + 0.4
      setScanPos(pos)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Cycle data streams
  useEffect(() => {
    const id = setInterval(() => setStreamIdx(i => (i + 1) % DATA_STREAMS.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient glow layers */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(59,130,246,0.10) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 50% at 50% 55%, rgba(139,92,246,0.08) 0%, transparent 65%)',
      }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Brain image hero */}
      <div style={{
        position: 'relative',
        width: 'min(420px, 85vw)',
        height: 'min(420px, 85vw)',
        marginBottom: '2rem',
        flexShrink: 0,
      }}>
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: '-8%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.10) 50%, transparent 70%)',
          animation: 'brainPulse 4s ease-in-out infinite',
        }} />
        {/* Scanning line over brain */}
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 5,
          top: `${scanPos}%`,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), rgba(139,92,246,0.8), transparent)',
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }} />
        {/* Brain image */}
        <img
          src="/brain.png"
          alt="Neural AI Brain"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '50%',
            filter: 'drop-shadow(0 0 32px rgba(59,130,246,0.5)) drop-shadow(0 0 64px rgba(139,92,246,0.25))',
            animation: 'brainFloat 6s ease-in-out infinite',
            position: 'relative',
            zIndex: 2,
          }}
        />
        {/* Corner energy nodes */}
        {[
          { top: '8%', left: '18%' },
          { top: '12%', right: '16%' },
          { bottom: '20%', left: '8%' },
          { bottom: '18%', right: '10%' },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', ...pos,
              width: 8, height: 8,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#3b82f6' : '#f59e0b',
              boxShadow: `0 0 12px ${i % 2 === 0 ? '#3b82f6' : '#f59e0b'}, 0 0 24px ${i % 2 === 0 ? '#3b82f6' : '#f59e0b'}`,
              animation: `nodePulse ${1.5 + i * 0.4}s ease-in-out infinite alternate`,
              zIndex: 6,
            }}
          />
        ))}
      </div>

      {/* Data stream ticker */}
      <div style={{
        height: 20,
        marginBottom: '1.5rem',
        opacity: showStreams ? 1 : 0,
        transition: 'opacity 0.6s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
          animation: 'nodePulse 1s ease-in-out infinite alternate',
        }} />
        <span style={{
          fontSize: '0.65rem',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#475569',
          letterSpacing: '0.12em',
          animation: 'streamFade 2.2s ease-in-out infinite',
        }}>
          {DATA_STREAMS[streamIdx]}
        </span>
      </div>

      {/* Animated title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        gap: 0,
        marginBottom: '1.25rem',
        position: 'relative',
        zIndex: 10,
      }}>
        {LETTERS.map((letter, i) => {
          const visible = i < visibleCount
          const isDash = letter === '-'
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                fontWeight: 800,
                letterSpacing: isDash ? '-0.01em' : '-0.03em',
                lineHeight: 1,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.7)',
                transition: 'opacity 0.35s cubic-bezier(.22,.68,0,1.2), transform 0.4s cubic-bezier(.22,.68,0,1.2)',
                background: visible
                  ? 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 30%, #8b5cf6 65%, #c4b5fd 100%)'
                  : 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: visible ? 'transparent' : 'transparent',
                backgroundClip: 'text',
                filter: visible ? 'drop-shadow(0 0 12px rgba(59,130,246,0.9))' : 'none',
                marginLeft: isDash ? '-0.02em' : undefined,
                marginRight: isDash ? '-0.02em' : undefined,
              }}
            >
              {letter === ' ' ? ' ' : letter}
            </span>
          )
        })}
      </div>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
        color: '#64748b',
        letterSpacing: '0.08em',
        textAlign: 'center',
        maxWidth: 420,
        padding: '0 1.5rem',
        lineHeight: 1.6,
        opacity: showSub ? 1 : 0,
        transform: showSub ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        marginBottom: '2.5rem',
      }}>
        Tech intelligence, distilled in real-time.
        <br />
        <span style={{ color: '#475569', fontSize: '0.85em' }}>
          AI-powered signals from the world's top sources.
        </span>
      </p>

      {/* CTA Button */}
      <button
        onClick={onEnter}
        style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s ease, background 0.2s ease',
          background: 'linear-gradient(135deg, #3b82f6, #6d28d9)',
          border: 'none',
          borderRadius: '0.75rem',
          padding: '0.85rem 2.5rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          boxShadow: '0 0 24px rgba(59,130,246,0.45), 0 0 48px rgba(139,92,246,0.2)',
          animation: showCta ? 'ctaPulse 3s ease-in-out infinite' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 0 36px rgba(59,130,246,0.7), 0 0 72px rgba(139,92,246,0.35)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.45), 0 0 48px rgba(139,92,246,0.2)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Enter Platform
        <span style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
          animation: 'shimmer 2.5s linear infinite',
          pointerEvents: 'none',
        }} />
      </button>

      {/* Bottom grid decoration */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '30%',
        background: 'linear-gradient(0deg, rgba(59,130,246,0.04) 0%, transparent 100%)',
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top corner version tag */}
      <div style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        fontSize: '0.65rem',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#1e3a5f',
        letterSpacing: '0.1em',
        border: '1px solid #1e2a3a',
        borderRadius: '4px',
        padding: '3px 8px',
      }}>
        v2.0
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes brainFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes brainPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          100% { transform: translateY(-20px) translateX(10px); opacity: 0.9; }
        }
        @keyframes nodePulse {
          0% { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(59,130,246,0.45), 0 0 48px rgba(139,92,246,0.2); }
          50% { box-shadow: 0 0 32px rgba(59,130,246,0.65), 0 0 64px rgba(139,92,246,0.35); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes streamFade {
          0%, 100% { opacity: 0.5; }
          10%, 90% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
