import { useRef, useEffect, useCallback } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const rafId = useRef(null)

  const animate = useCallback(() => {
    pos.current.x += (target.current.x - pos.current.x) * 0.35
    pos.current.y += (target.current.y - pos.current.y) * 0.35

    if (cursorRef.current) {
      cursorRef.current.style.transform =
        `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`
    }
    rafId.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!isFinePointer) return

    const cursor = cursorRef.current
    if (!cursor) return

    const onMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
      cursor.classList.remove('custom-cursor--hidden')
    }

    const onLeave = () => cursor.classList.add('custom-cursor--hidden')
    const onEnter = () => cursor.classList.remove('custom-cursor--hidden')
    const onDown = () => cursor.classList.add('custom-cursor--click')
    const onUp = () => cursor.classList.remove('custom-cursor--click')

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    rafId.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(rafId.current)
    }
  }, [animate])

  const isFinePointer =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  if (!isFinePointer) return null

  return <div ref={cursorRef} className="custom-cursor custom-cursor--hidden" />
}
