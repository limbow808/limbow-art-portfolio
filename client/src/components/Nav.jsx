import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './Nav.module.css'

export default function Nav() {
  const location = useLocation()
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'light'
  )

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('limbow-theme', next)
    setTheme(next)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/info"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>

        <div className={styles.bannerWrap}>
          <div className={styles.commissionBanner}>
            <span className={styles.dot} />
            <NavLink to="/contact">Open for commissions</NavLink>
          </div>
        </div>

        <button
          className={`${styles.themeToggle} ${theme === 'dark' ? styles.toggled : ''}`}
          onClick={toggleTheme}
          type="button"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            width="1em"
            height="1em"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <clipPath id="theme-cut">
              <path d={
                theme === 'dark'
                  ? 'M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0'
                  : 'M0-5h55v37h-55zm32 12a1 1 0 0025 0 1 1 0 00-25 0'
              } />
            </clipPath>
            <g clipPath="url(#theme-cut)">
              <circle cx="16" cy="16" r="15" />
            </g>
          </svg>
        </button>
      </nav>
    </header>
  )
}
