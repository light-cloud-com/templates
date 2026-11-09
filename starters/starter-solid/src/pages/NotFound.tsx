import type { Component } from 'solid-js';
import { A } from '@solidjs/router';

const NotFound: Component = () => {
  return (
    <section>
      <h1>Page not found</h1>
      <p>
        <A href="/">Back to the home page</A>
      </p>
    </section>
  );
};

export default NotFound;
