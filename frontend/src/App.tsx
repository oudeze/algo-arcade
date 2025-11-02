import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState<string>('loading...')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('backend not connected'))
  }, [])

  return (
    <div className="app">
      <h1>Algorithms Arcade</h1>
      <p>Backend status: {status}</p>
      <p>More to come soon...</p>
    </div>
  )
}

export default App

