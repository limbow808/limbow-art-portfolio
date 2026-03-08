import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import ProgressiveImage from '../components/ProgressiveImage'
import Lightbox from '../components/Lightbox'
import { useProjectData } from '../hooks/useData'
import styles from './Project.module.css'

function ViewerSection({ section, sIdx, title, currentIdx, setViewerIndex, openLightbox }) {
  const [imgLoaded, setImgLoaded] = useState(true)
  const containerRef = useRef(null)
  const currentImage = section.images[currentIdx]

  // Preload adjacent images
  useEffect(() => {
    const preload = (idx) => {
      if (idx >= 0 && idx < section.images.length) {
        const img = new Image()
        img.src = `${section.images[idx].path}?w=2000`
      }
    }
    preload(currentIdx + 1)
    preload(currentIdx - 1)
  }, [currentIdx, section.images])

  const handleSwitch = (newIdx) => {
    setImgLoaded(false)
    setViewerIndex(sIdx, newIdx)
  }

  return (
    <Reveal key={sIdx} delay={0.1}>
      <div className={styles.viewer} ref={containerRef}>
        <div className={styles.viewerImageWrap}>
          <img
            key={currentImage?.path}
            src={`${currentImage?.path}?w=2000`}
            alt={currentImage?.name || title}
            className={`${styles.viewerImage} ${!imgLoaded ? styles.viewerImageLoading : ''}`}
            onLoad={() => setImgLoaded(true)}
            onClick={() =>
              openLightbox(
                section.images.map((v) => ({ src: `${v.path}?w=2000`, name: v.name })),
                currentIdx
              )
            }
          />
          {!imgLoaded && <div className={styles.viewerSpinner} />}
        </div>

        {section.images.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowLeft}`}
              onClick={() =>
                handleSwitch(
                  (currentIdx - 1 + section.images.length) % section.images.length
                )
              }
              aria-label="Previous"
            >
              &#8249;
            </button>
            <button
              className={`${styles.arrow} ${styles.arrowRight}`}
              onClick={() =>
                handleSwitch((currentIdx + 1) % section.images.length)
              }
              aria-label="Next"
            >
              &#8250;
            </button>

            <div className={styles.thumbs}>
              {section.images.map((v, i) => (
                <img
                  key={v.path}
                  src={`${v.path}?w=200`}
                  alt={v.name}
                  className={`${styles.thumb} ${i === currentIdx ? styles.thumbActive : ''}`}
                  onClick={() => handleSwitch(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {(section.label || section.description) && (
        <div className={`${styles.panel} ${styles.viewerCaption}`}>
          {section.label && (
            <span className={styles.panelLabel}>{section.label}</span>
          )}
          {section.description && (
            <p className={styles.panelText}>{section.description}</p>
          )}
        </div>
      )}
    </Reveal>
  )
}

export default function Project() {
  const { slug } = useParams()
  const { project, loading } = useProjectData(slug)
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 })
  const [viewerState, setViewerState] = useState({})

  if (loading) {
    return (
      <PageTransition>
        <div className={styles.page}>
          <div className={styles.skeleton} />
        </div>
      </PageTransition>
    )
  }

  if (!project) {
    return (
      <PageTransition>
        <div className={styles.page}>
          <h1>Project not found</h1>
          <Link to="/" className={styles.backLink}>&larr; Back to Gallery</Link>
        </div>
      </PageTransition>
    )
  }

  const {
    title,
    category,
    workType,
    date,
    notes,
    software,
    mainImagePath,
    viewerSections = [],
    galleryItems = [],
    galleryLabel,
    workflowImages = [],
    workflowLabel = 'Process',
  } = project

  const infoItems = []
  if (title) infoItems.push({ label: 'Project', value: title })
  if (category) infoItems.push({ label: 'Category', value: category })
  if (workType) infoItems.push({ label: 'Type', value: workType })
  if (date) infoItems.push({ label: 'Date', value: date })

  const softwareList = (software || project.tools || [])
    .flatMap((t) => t.split(',').map((s) => s.trim()))
    .filter(Boolean)

  const getViewerIndex = (sIdx) => viewerState[sIdx] || 0

  const setViewerIndex = (sIdx, idx) => {
    setViewerState((prev) => ({ ...prev, [sIdx]: idx }))
  }

  const openLightbox = (images, index) => {
    setLightbox({ open: true, images, index })
  }

  const showOnlyMainImage =
    mainImagePath && viewerSections.length === 0 && galleryItems.length === 0

  return (
    <PageTransition>
      <div className={styles.page}>
        <Reveal>
          <Link to="/" className={styles.backLink}>&larr; Back to Gallery</Link>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className={styles.title}>{title || slug}</h1>
        </Reveal>

        {/* Info panels */}
        <div className={styles.panels}>
          {infoItems.length > 0 && (
            <Reveal delay={0.1}>
              <div className={`${styles.panel} ${styles.panelInfo}`}>
                {infoItems.map((item) => (
                  <div key={item.label} className={styles.panelItem}>
                    <span className={styles.panelLabel}>{item.label}</span>
                    <span className={styles.panelValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {notes && (
            <Reveal delay={0.15}>
              <div className={`${styles.panel} ${styles.panelNotes}`}>
                <span className={styles.panelLabel}>Notes</span>
                <p className={styles.panelText}>{notes}</p>
              </div>
            </Reveal>
          )}

          {softwareList.length > 0 && (
            <Reveal delay={0.2}>
              <div className={`${styles.panel} ${styles.panelTools}`}>
                <span className={styles.panelLabel}>Software</span>
                <div className={styles.toolsList}>
                  {softwareList.map((sw) => (
                    <span key={sw} className={styles.toolTag}>{sw}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* Main image (when no viewer/gallery) */}
        {showOnlyMainImage && (
          <Reveal delay={0.15}>
            <div
              className={styles.viewer}
              onClick={() => openLightbox([{ src: `${mainImagePath}?w=2000` }], 0)}
            >
              <img
                src={`${mainImagePath}?w=2000`}
                alt={title}
                className={styles.viewerImage}
              />
            </div>
          </Reveal>
        )}

        {/* Viewer sections */}
        {viewerSections.map((section, sIdx) => (
          <ViewerSection
            key={sIdx}
            section={section}
            sIdx={sIdx}
            title={title}
            currentIdx={getViewerIndex(sIdx)}
            setViewerIndex={setViewerIndex}
            openLightbox={openLightbox}
          />
        ))}

        {/* Gallery */}
        {galleryItems.length > 0 && (
          <Reveal>
            {galleryLabel && (
              <h2 className={styles.sectionHeading}>{galleryLabel}</h2>
            )}
            <div className={styles.gallery}>
              {galleryItems.map((item, i) =>
                item.type === 'image' ? (
                  <div
                    key={i}
                    className={styles.galleryCell}
                    onClick={() =>
                      openLightbox(
                        galleryItems
                          .filter((g) => g.type === 'image')
                          .map((g) => ({ src: `${g.src}?w=2000` })),
                        galleryItems.filter((g) => g.type === 'image').indexOf(item)
                      )
                    }
                  >
                    <img
                      src={`${item.src}?w=1400`}
                      alt=""
                      loading="lazy"
                      className={styles.galleryImg}
                    />
                  </div>
                ) : (
                  <div key={i} className={styles.galleryNote}>
                    <p>{item.text}</p>
                  </div>
                )
              )}
            </div>
          </Reveal>
        )}

        {/* Workflow / Process */}
        {workflowImages.length > 0 && (
          <Reveal>
            <h2 className={styles.sectionHeading}>{workflowLabel}</h2>
            <div className={styles.workflow}>
              {workflowImages.map((img, i) => (
                <img
                  key={i}
                  src={`${img}?w=800`}
                  alt=""
                  loading="lazy"
                  className={styles.workflowImg}
                  onClick={() =>
                    openLightbox(
                      workflowImages.map((w) => ({ src: `${w}?w=2000` })),
                      i
                    )
                  }
                />
              ))}
            </div>
          </Reveal>
        )}

        {/* Lightbox */}
        {lightbox.open && (
          <Lightbox
            images={lightbox.images}
            currentIndex={lightbox.index}
            onClose={() => setLightbox({ open: false, images: [], index: 0 })}
            onNavigate={(i) => setLightbox((prev) => ({ ...prev, index: i }))}
          />
        )}
      </div>
    </PageTransition>
  )
}
