import styles from './ProgressiveImage.module.css'

export default function ProgressiveImage({
  src,
  alt,
  avgColor = '#e8e8e8',
  aspectRatio,
  className = '',
  sizes,
  loading = 'lazy',
  onClick,
}) {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{ aspectRatio, backgroundColor: avgColor }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        src={src}
        alt={alt || ''}
        loading={loading}
        sizes={sizes}
        className={styles.image}
      />
    </div>
  )
}
