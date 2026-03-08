import { useState, useCallback } from 'react'
import PageTransition from '../components/PageTransition'
import Reveal from '../components/Reveal'
import styles from './Contact.module.css'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const email = 'prodlimbow@gmail.com'

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }, [email])

  const socials = [
    { label: 'instagram', href: 'https://www.instagram.com/limmbow/' },
    { label: 'youtube', href: 'https://www.youtube.com/@limmbow' },
    { label: 'soundcloud', href: 'https://soundcloud.com/limbowmusic' },
    { label: 'discord', href: 'https://discord.com/users/191199439187214336' },
  ]

  return (
    <PageTransition>
      <div className={styles.page}>
        <div className={styles.content}>
          <Reveal>
            <div className={styles.box}>
              <div
                className={styles.emailCopy}
                onClick={copyEmail}
                data-hover
              >
                {email}
                <span className={`${styles.hint} ${copied ? styles.hintVisible : ''}`}>
                  {copied ? 'Copied!' : 'Click to copy'}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className={styles.links}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  className={styles.linkTag}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  )
}
