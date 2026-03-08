import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import styles from './Impressum.module.css'

export default function Impressum() {
  return (
    <PageTransition>
      <div className={styles.page}>
        <Reveal>
          <h2 className={styles.heading}>Impressum</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p>Name: limbow</p>
          <p>
            Email:{' '}
            <a href="mailto:prodlimbow@gmail.com">prodlimbow@gmail.com</a>
          </p>
          <p>
            Instagram:{' '}
            <a
              href="https://www.instagram.com/limmbow/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @limmbow
            </a>
          </p>
          <p>
            Youtube:{' '}
            <a
              href="https://www.youtube.com/@limmbow"
              target="_blank"
              rel="noopener noreferrer"
            >
              @limmbow
            </a>
          </p>
          <p>
            Soundcloud:{' '}
            <a
              href="https://soundcloud.com/limbowmusic"
              target="_blank"
              rel="noopener noreferrer"
            >
              limbowmusic
            </a>
          </p>
        </Reveal>
      </div>
    </PageTransition>
  )
}
