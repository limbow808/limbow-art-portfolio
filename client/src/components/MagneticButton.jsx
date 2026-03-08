import { useState, useRef } from 'react'

export default function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null)
  const [transform, setTransform] = useState('translate3d(0,0,0)')

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setTransform(`translate3d(${x * 0.2}px, ${y * 0.2}px, 0)`)
  }

  const handleLeave = () => {
    setTransform('translate3d(0,0,0)')
  }

  return (
    <button
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
