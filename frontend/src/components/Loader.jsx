import { useState, useEffect } from 'react'

const FINAL = 'VIBRANIUM.'

export default function Loader({ onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [slideUp, setSlideUp] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(FINAL.slice(0, i + 1))
      i++
      if (i >= FINAL.length) {
        clearInterval(interval)
        setTimeout(() => {
          setSlideUp(true)
          setTimeout(onComplete, 700)
        }, 700)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'var(--bg)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      padding: '0 0 80px 48px',
      zIndex: 9999,
      transform: slideUp ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)',
    }}>
      <span style={{
        color: 'var(--accent)',
        fontSize: 'clamp(64px, 12vw, 160px)',
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-hero)', fontWeight: '400',
        lineHeight: 1,
      }}>
        {displayed}
        {displayed.length < FINAL.length && (
          <span style={{ opacity: 0.4 }}>|</span>
        )}
      </span>
    </div>
  )
}
