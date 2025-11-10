import { useState } from 'react'
import PackingPlanner from './apps/PackingPlanner'
import RoutePlanner from './apps/RoutePlanner'
import LineupOptimizer from './apps/LineupOptimizer'
import './App.css'

type AppView = 'packing' | 'route' | 'lineup'

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
          <button
            className={currentView === 'lineup' ? 'active' : ''}
            onClick={() => setCurrentView('lineup')}
          >
            Lineup Optimizer
          </button>
        </div>
      </nav>
      <main>
        {currentView === 'packing' && <PackingPlanner />}
        {currentView === 'route' && <RoutePlanner />}
        {currentView === 'lineup' && <LineupOptimizer />}
      </main>
    </div>
  )
}

export default App
