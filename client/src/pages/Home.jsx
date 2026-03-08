import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import ProgressiveImage from '../components/ProgressiveImage'
import { useHomeData } from '../hooks/useData'
import styles from './Home.module.css'



export default function Home() {
  const { heroImages, galleryImages, loading } = useHomeData()

  return (
    <PageTransition>
      <div className={styles.overview}>

        {/* --- Recent Work --- */}
        <Reveal>
          <h2 className={styles.sectionHeading}>Recent Work</h2>
        </Reveal>

        {loading ? (
          <>
            <div className={styles.heroSkeleton} />
            <div className={styles.heroSkeleton} />
          </>
        ) : (
          heroImages.map((img, idx) => (
            <Reveal key={img.slug} delay={idx * 0.1}>
              <Link to={`/project/${img.slug}`} className={styles.heroLink}>
                <div className={styles.heroCard}>
                  <ProgressiveImage
                    src={`${img.path}?w=2000`}
                    alt={img.name}
                    avgColor={img.avgColor}
                    aspectRatio={img.aspectRatio}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    sizes="(max-width: 900px) 100vw, 1400px"
                  />
                  <div className={styles.cardMeta}>
                    <h3 className={styles.cardTitle}>{img.name}</h3>
                    <p className={styles.cardType}>{img.workType}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))
        )}

        {/* --- Gallery --- */}
        <Reveal>
          <h2 className={`${styles.sectionHeading} ${styles.galleryHeading}`}>
            Gallery
          </h2>
        </Reveal>

        {loading ? (
          <div className={styles.galleryGrid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles.galleryItem}>
                <div className={styles.gallerySkeleton} style={{ aspectRatio: i % 3 === 0 ? '1/1' : i % 3 === 1 ? '3/4' : '4/3' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {galleryImages.map((img) => (
            <div key={img.slug} className={styles.galleryItem}>
              <Link to={`/project/${img.slug}`} className={styles.galleryLink}>
                <div className={styles.galleryCard}>
                  <ProgressiveImage
                    src={`${img.path}?w=650`}
                    alt={img.name}
                    avgColor={img.avgColor}
                    aspectRatio={img.aspectRatio}
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 350px"
                  />
                  <div className={styles.cardMeta}>
                    <h3 className={styles.cardTitle}>{img.name}</h3>
                    <p className={styles.cardType}>{img.workType}</p>
                  </div>
                </div>
              </Link>
            </div>
            ))}
          </div>
        )}

        {/* --- CTA --- */}
        <Reveal>
          <div className={styles.cta}>
            <p className={styles.ctaText}>Interested in working together?</p>
            <Link to="/contact" className={styles.ctaBtn} data-hover>
              Get in Touch
            </Link>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  )
}
