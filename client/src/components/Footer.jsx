import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.rights}>
        &copy; {new Date().getFullYear()} limbow
        <span aria-hidden="true"> | </span>
        <Link to="/impressum">impressum</Link>
      </p>
    </footer>
  )
}
