import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Lightbox.module.css'

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const current = images[currentIndex]
  const [imgLoaded, setImgLoaded] = useState(false)

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % images.length)
  }, [currentIndex, images.length, onNavigate])

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + images.length) % images.length)
  }, [currentIndex, images.length, onNavigate])

  // Reset loaded state when image changes; preload adjacent
  useEffect(() => {
    setImgLoaded(false)
    const preload = (idx) => {
      const wrapped = ((idx % images.length) + images.length) % images.length
      const item = images[wrapped]
      if (item) {
        const img = new Image()
        img.src = item.src || item.path || item
      }
    }
    preload(currentIndex + 1)
    preload(currentIndex - 1)
  }, [currentIndex, images])

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

  const imgSrc = current.src || current.path || current

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
            key={imgSrc}
            src={imgSrc}
            alt={current.alt || current.name || ''}
            className={`${styles.image} ${!imgLoaded ? styles.imageLoading : ''}`}
            onLoad={() => setImgLoaded(true)}
          />
          {!imgLoaded && <div className={styles.spinner} />}
        </motion.div>

        {/* Counter */}
        {images.length > 1 && (
          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Nav arrows — always shown for cycling */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              aria-label="Previous"
            >
              &#8249;
            </button>
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={(e) => { e.stopPropagation(); goNext() }}
              aria-label="Next"
            >
              &#8250;
            </button>
          </>
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
