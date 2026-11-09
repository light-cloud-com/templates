import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <h1>Welcome to React</h1>
        <p>Your app is ready to deploy on Light Cloud</p>
      </header>
      <main className="main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
          <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
        </div>
      </main>
      <footer className="footer">
        <p>Deployed with Light Cloud</p>
      </footer>
    </div>
  )
}

export default App
