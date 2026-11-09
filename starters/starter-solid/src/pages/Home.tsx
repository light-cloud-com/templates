import type { Component } from 'solid-js';
import Counter from '../components/Counter';

const Home: Component = () => {
  return (
    <section>
      <h1>Welcome to SolidJS</h1>
      <p>Your app is ready to deploy on Light Cloud.</p>
      <Counter />
      <p>
        Edit <code>src/pages/Home.tsx</code> and save to see the change.
      </p>
    </section>
  );
};

export default Home;
