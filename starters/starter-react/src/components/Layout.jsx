import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

const title = import.meta.env.VITE_APP_TITLE || 'React App'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span className={styles.brand}>{title}</span>
        <nav className={styles.nav}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>Deployed with Light Cloud</footer>
    </div>
  )
}
