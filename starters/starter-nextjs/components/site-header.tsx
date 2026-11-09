import Link from "next/link";
import styles from "./site-header.module.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Next.js App";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {siteName}
      </Link>
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
