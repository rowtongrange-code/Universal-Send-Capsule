import { useState } from 'react'
import CreateCapsule from './components/CreateCapsule'
import OpenCapsule from './components/OpenCapsule'
import './App.css'

export default function App() {
  const [page, setPage] = useState('home')
  const [capsuleData, setCapsuleData] = useState(null)

  const hash = window.location.hash.slice(1)

  if (hash && page === 'home') {
    setPage('open')
  }

  return (
    <div className="app">
      <header>
        <h1>📦 Universal Send Capsule</h1>
        <p>Send, receive and save anything. Simply.</p>
      </header>

      <nav>
        <button onClick={() => setPage('create')}>Create Capsule</button>
        <button onClick={() => setPage('open')}>Open Capsule</button>
      </nav>

      <main>
        {page === 'home' && (
          <div className="home">
            <h2>Welcome to USC</h2>
            <p>Drop any file into a capsule and share it with anyone, anywhere.</p>
            <p>No account needed to receive. Works on any phone or computer.</p>
            <button onClick={() => setPage('create')}>Get Started</button>
          </div>
        )}
        {page === 'create' && <CreateCapsule />}
        {page === 'open' && <OpenCapsule />}
      </main>
    </div>
  )
}