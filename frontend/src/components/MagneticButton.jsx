import { useRef, useState, useEffect } from "react"

const COUNT = 16

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// stable random particle field, computed once
function makeParticles() {
  const arr = []
  for (let i = 0; i < COUNT; i++) {
    const ang = Math.random() * Math.PI * 2
    const dist = 80 + Math.random() * 160
    arr.push({
      ox: Math.cos(ang) * dist,
      oy: Math.sin(ang) * dist * 0.8,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 0.18,
    })
  }
  return arr
}

export default function MagneticButton({ onClick, disabled, baseStyle, children }) {
  const btnRef = useRef(null)
  const particlesRef = useRef(makeParticles())
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setEnabled(fine && !reduce)
  }, [])

  function onMove(e) {
    if (!enabled || disabled) return
    const r = btnRef.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    setPos({ x: clamp(dx * 0.06, -12, 12), y: clamp(dy * 0.3, -8, 8) })
  }

  function onLeave() {
    setHover(false)
    setPos({ x: 0, y: 0 })
  }

  // coarse pointer / reduced motion -> plain button, nothing fancy
  if (!enabled) {
    return (
      <button ref={btnRef} onClick={onClick} disabled={disabled} style={baseStyle}>
        {children}
      </button>
    )
  }

  const lift = hover ? -2 : 0
  const dynamicStyle = {
    marginTop: 0,
    background: hover && !disabled ? "var(--accent-hover)" : "var(--accent)",
    transform: "translate(" + pos.x + "px, " + (pos.y + lift) + "px)",
    transition: "transform 0.18s cubic-bezier(0.2,0.7,0.2,1), background 0.18s ease",
  }
  const btnStyle = Object.assign({}, baseStyle, dynamicStyle)

  const wrapStyle = { position: "relative", marginTop: "56px" }

  return (
    <div style={wrapStyle}>
      {particlesRef.current.map((p, i) => {
        const pStyle = {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: p.size + "px",
          height: p.size + "px",
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          boxShadow: "0 0 6px rgba(230,210,162,0.8)",
          transform: hover
            ? "translate(-50%, -50%) scale(0.4)"
            : "translate(calc(-50% + " + p.ox + "px), calc(-50% + " + p.oy + "px)) scale(1)",
          opacity: hover ? 0.9 : 0,
          transition: "transform 0.6s ease-out " + p.delay + "s, opacity 0.6s ease-out " + p.delay + "s",
        }
        return <span key={i} style={pStyle} />
      })}
      <button
        ref={btnRef}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={onLeave}
        onMouseMove={onMove}
        style={btnStyle}
      >
        {children}
      </button>
    </div>
  )
}