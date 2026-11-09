import type { Component } from 'solid-js';
import { lazy } from 'solid-js';
import { Route, Router } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';

// Lazy-loaded: built into their own chunks, fetched when the route is visited.
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: Component = () => {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="*404" component={NotFound} />
    </Router>
  );
};

export default App;
