import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Lightbox.module.css'

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const current = images[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) onNavigate(currentIndex + 1)
  }, [currentIndex, images.length, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1)
  }, [currentIndex, onNavigate])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  if (!current) return null

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.content}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={current.src || current.path || current}
            alt={current.alt || current.name || ''}
            className={styles.image}
          />
        </motion.div>

        {/* Counter */}
        {images.length > 1 && (
          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Nav arrows */}
        {currentIndex > 0 && (
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Previous"
          >
            &#8249;
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Next"
          >
            &#8250;
          </button>
        )}

        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
