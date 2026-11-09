<script>
  import Ticks from './Ticks.svelte'
  import svelteLogo from '../../assets/svelte.svg'
  import viteLogo from '../../assets/vite.svg'

  const social = [
    { href: 'https://github.com/vitejs/vite', icon: 'github-icon', label: 'GitHub' },
    { href: 'https://chat.vite.dev/', icon: 'discord-icon', label: 'Discord' },
    { href: 'https://x.com/vite_js', icon: 'x-icon', label: 'X.com' },
    { href: 'https://bsky.app/profile/vite.dev', icon: 'bluesky-icon', label: 'Bluesky' },
  ]
</script>

<Ticks />

<section class="next-steps">
  <div class="docs">
    <svg class="icon" role="presentation" aria-hidden="true">
      <use href="/icons.svg#documentation-icon"></use>
    </svg>
    <h2>Documentation</h2>
    <p>Your questions, answered</p>
    <ul>
      <li>
        <a href="https://vite.dev/" target="_blank" rel="noreferrer">
          <img class="logo" src={viteLogo} alt="" />
          Explore Vite
        </a>
      </li>
      <li>
        <a href="https://svelte.dev/" target="_blank" rel="noreferrer">
          <img class="button-icon" src={svelteLogo} alt="" />
          Learn more
        </a>
      </li>
    </ul>
  </div>
  <div class="social">
    <svg class="icon" role="presentation" aria-hidden="true">
      <use href="/icons.svg#social-icon"></use>
    </svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      {#each social as link (link.href)}
        <li>
          <a href={link.href} target="_blank" rel="noreferrer">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#{link.icon}"></use>
            </svg>
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  .next-steps {
    display: flex;
    border-top: 1px solid var(--border);
    text-align: left;

    & > div {
      flex: 1 1 0;
      padding: 32px;
      @media (max-width: 1024px) {
        padding: 24px 20px;
      }
    }

    .icon {
      margin-bottom: 16px;
      width: 22px;
      height: 22px;
    }

    @media (max-width: 1024px) {
      flex-direction: column;
      text-align: center;
    }
  }

  .docs {
    border-right: 1px solid var(--border);

    @media (max-width: 1024px) {
      border-right: none;
      border-bottom: 1px solid var(--border);
    }
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    gap: 8px;
    margin: 32px 0 0;

    .logo {
      height: 18px;
    }

    a {
      color: var(--text-h);
      font-size: 16px;
      border-radius: 6px;
      background: var(--social-bg);
      display: flex;
      padding: 6px 12px;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: var(--shadow);
      }
      .button-icon {
        height: 18px;
        width: 18px;
      }
    }

    @media (max-width: 1024px) {
      margin-top: 20px;
      flex-wrap: wrap;
      justify-content: center;

      li {
        flex: 1 1 calc(50% - 8px);
      }

      a {
        width: 100%;
        justify-content: center;
        box-sizing: border-box;
      }
    }
  }

  @media (prefers-color-scheme: dark) {
    .social .button-icon {
      filter: invert(1) brightness(2);
    }
  }
</style>
