import { useState } from 'react'
import PackingPlanner from './apps/PackingPlanner'
import RoutePlanner from './apps/RoutePlanner'
import './App.css'

type AppView = 'packing' | 'route'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('packing')

  return (
    <div className="app">
      <nav className="app-nav">
        <h1>Algorithms Arcade</h1>
        <div className="nav-links">
          <button
            className={currentView === 'packing' ? 'active' : ''}
            onClick={() => setCurrentView('packing')}
          >
            Packing Planner
          </button>
          <button
            className={currentView === 'route' ? 'active' : ''}
            onClick={() => setCurrentView('route')}
          >
            Route Optimizer
          </button>
        </div>
      </nav>
      <main>
        {currentView === 'packing' && <PackingPlanner />}
        {currentView === 'route' && <RoutePlanner />}
      </main>
    </div>
  )
}

export default App
