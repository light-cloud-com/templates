<script>
  import svelteLogo from '../../assets/svelte.svg'
  import viteLogo from '../../assets/vite.svg'
  import heroImg from '../../assets/hero.png'
  import Counter from './Counter.svelte'

  const title = import.meta.env.VITE_APP_TITLE || 'Get started'
</script>

<section class="center">
  <div class="hero">
    <img src={heroImg} class="base" width="170" height="179" alt="" />
    <img src={svelteLogo} class="framework" alt="Svelte logo" />
    <img src={viteLogo} class="vite" alt="Vite logo" />
  </div>
  <div>
    <h1>{title}</h1>
    <p>Edit <code>src/lib/components/Hero.svelte</code> and save to test <code>HMR</code></p>
  </div>
  <Counter />
</section>

<style>
  .center {
    display: flex;
    flex-direction: column;
    gap: 25px;
    place-content: center;
    place-items: center;
    flex-grow: 1;

    @media (max-width: 1024px) {
      padding: 32px 20px 24px;
      gap: 18px;
    }
  }

  .hero {
    position: relative;

    .base,
    .framework,
    .vite {
      inset-inline: 0;
      margin: 0 auto;
    }

    .base {
      width: 170px;
      position: relative;
      z-index: 0;
    }

    .framework,
    .vite {
      position: absolute;
    }

    .framework {
      z-index: 1;
      top: 34px;
      height: 28px;
      transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4);
    }

    .vite {
      z-index: 0;
      top: 107px;
      height: 26px;
      width: auto;
      transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8);
    }
  }
</style>
