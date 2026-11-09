import { useState } from 'react'
import styles from './Counter.module.css'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button type="button" className={styles.button} onClick={() => setCount((c) => c + 1)}>
      Count is {count}
    </button>
  )
}
