import type { ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';
import styles from './Layout.module.css';

const title = import.meta.env.VITE_APP_TITLE || 'Solid App';

const Layout: ParentComponent = (props) => {
  return (
    <div class={styles.layout}>
      <header class={styles.header}>
        <span class={styles.brand}>{title}</span>
        <nav class={styles.nav}>
          <A href="/" end>
            Home
          </A>
          <A href="/about">About</A>
        </nav>
      </header>
      <main class={styles.main}>{props.children}</main>
      <footer class={styles.footer}>Deployed with Light Cloud</footer>
    </div>
  );
};

export default Layout;
