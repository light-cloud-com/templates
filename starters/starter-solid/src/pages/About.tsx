import type { Component } from 'solid-js';

const About: Component = () => {
  return (
    <section>
      <h1>About</h1>
      <p>
        A SolidJS single-page app built with Vite and TypeScript. Pages live in <code>src/pages</code>,
        shared pieces in <code>src/components</code>, and routes in <code>src/App.tsx</code>.
      </p>
    </section>
  );
};

export default About;
