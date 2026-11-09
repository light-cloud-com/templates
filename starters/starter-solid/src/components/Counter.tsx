import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import styles from './Counter.module.css';

const Counter: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <button type="button" class={styles.button} onClick={() => setCount((c) => c + 1)}>
      Count is {count()}
    </button>
  );
};

export default Counter;
