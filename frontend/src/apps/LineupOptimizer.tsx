import { useState } from 'react'
import './LineupOptimizer.css'

interface Player {
  name: string
  position: string
  salary: number
  projection: number
}

interface LineupResult {
  lineup: Player[]
  total_projection: number
  total_salary: number
  constraint_info: {
    status: string
    salary_used: number
    salary_remaining: number
    salary_used_pct: number
    position_counts: Record<string, number>
  }
}

function LineupOptimizer() {
  const [salaryCap, setSalaryCap] = useState(50000)
  const [positions, setPositions] = useState({
    QB: 1,
    RB: 2,
    WR: 3,
    TE: 1,
    FLEX: 1,
    DST: 1
  })
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player A', position: 'QB', salary: 8000, projection: 22.5 },
    { name: 'Player B', position: 'QB', salary: 7500, projection: 21.0 },
    { name: 'Player C', position: 'RB', salary: 9500, projection: 18.5 }
  ])
  const [result, setResult] = useState<LineupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExample = async () => {
    try {
      const response = await fetch('/api/lineup/example')
      const data = await response.json()
      setSalaryCap(data.salary_cap)
      setPositions(data.positions)
      setPlayers(data.players)
    } catch (err) {
      console.error('Failed to load example:', err)
    }
  }

  const solveLineup = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/lineup/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players,
          salary_cap: salaryCap,
          positions
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to solve')
      }
      
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = () => {
    setPlayers([...players, { name: '', position: 'QB', salary: 0, projection: 0 }])
  }

  const updatePlayer = (index: number, field: keyof Player, value: string | number) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePosition = (pos: string, value: number) => {
    setPositions({ ...positions, [pos]: value })
  }

  const getPositionColor = (pos: string) => {
    const colors: Record<string, string> = {
      QB: '#007bff',
      RB: '#28a745',
      WR: '#ffc107',
      TE: '#dc3545',
      FLEX: '#6c757d',
      DST: '#17a2b8'
    }
    return colors[pos] || '#6c757d'
  }

  return (
    <div className="lineup-optimizer">
      <h1>Fantasy Lineup Optimizer</h1>
      <p className="subtitle">ILP optimization with position and salary constraints</p>

      <div className="controls">
        <button onClick={loadExample} className="btn-secondary">Load Example</button>
        <button onClick={solveLineup} disabled={loading} className="btn-primary">
          {loading ? 'Optimizing...' : 'Optimize Lineup'}
        </button>
      </div>

      <div className="constraints-section">
        <h2>Constraints</h2>
        <div className="constraints-grid">
          <div className="constraint-item">
            <label>Salary Cap:</label>
            <input
              type="number"
              value={salaryCap}
              onChange={(e) => setSalaryCap(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="position-constraints">
            <label>Position Requirements:</label>
            <div className="positions-grid">
              {Object.entries(positions).map(([pos, count]) => (
                <div key={pos} className="position-input">
                  <span className="position-label" style={{color: getPositionColor(pos)}}>
                    {pos}:
                  </span>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => updatePosition(pos, Number(e.target.value))}
                    min="0"
                    className="position-count"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="players-section">
        <h2>Players</h2>
        <button onClick={addPlayer} className="btn-small">+ Add Player</button>
        <table className="players-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Projection</th>
              <th>Value</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder="Player name"
                  />
                </td>
                <td>
                  <select
                    value={player.position}
                    onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                  >
                    <option value="QB">QB</option>
                    <option value="RB">RB</option>
                    <option value="WR">WR</option>
                    <option value="TE">TE</option>
                    <option value="DST">DST</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={player.salary}
                    onChange={(e) => updatePlayer(index, 'salary', Number(e.target.value))}
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={player.projection}
                    onChange={(e) => updatePlayer(index, 'projection', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </td>
                <td className="value-cell">
                  {player.salary > 0 ? (player.projection / player.salary * 1000).toFixed(2) : '0.00'}
                </td>
                <td>
                  <button onClick={() => removePlayer(index)} className="btn-remove">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <h2>Optimized Lineup</h2>
          
          <div className="lineup-summary">
            <div className="summary-stat">
              <label>Total Projection:</label>
              <strong>{result.total_projection.toFixed(2)}</strong> points
            </div>
            <div className="summary-stat">
              <label>Total Salary:</label>
              <strong>${result.total_salary.toLocaleString()}</strong>
              <span className="salary-pct">
                ({result.constraint_info.salary_used_pct.toFixed(1)}% of cap)
              </span>
            </div>
            <div className="summary-stat">
              <label>Status:</label>
              <span className={`status-badge ${result.constraint_info.status}`}>
                {result.constraint_info.status}
              </span>
            </div>
          </div>

          <div className="constraint-info">
            <h3>Constraint Satisfaction</h3>
            <div className="constraint-details">
              <div className="constraint-row">
                <span>Salary Used:</span>
                <span>${result.constraint_info.salary_used.toLocaleString()} / ${salaryCap.toLocaleString()}</span>
                <span className="constraint-status">
                  {result.constraint_info.salary_remaining >= 0 ? '✓' : '✗'}
                </span>
              </div>
              <div className="constraint-row">
                <span>Salary Remaining:</span>
                <span>${result.constraint_info.salary_remaining.toLocaleString()}</span>
              </div>
              <div className="position-constraints-detail">
                <strong>Position Counts:</strong>
                <div className="position-counts-grid">
                  {Object.entries(positions).map(([pos, required]) => {
                    const actual = result.constraint_info.position_counts[pos] || 0
                    const satisfied = pos === 'FLEX' 
                      ? actual >= required 
                      : actual === required
                    return (
                      <div key={pos} className="position-constraint-item">
                        <span className="position-label" style={{color: getPositionColor(pos)}}>
                          {pos}:
                        </span>
                        <span>{actual} / {required}</span>
                        <span className={`constraint-status ${satisfied ? 'satisfied' : 'unsatisfied'}`}>
                          {satisfied ? '✓' : '✗'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lineup-table">
            <h3>Selected Lineup</h3>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Name</th>
                  <th>Salary</th>
                  <th>Projection</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {result.lineup.map((player, index) => (
                  <tr key={index}>
                    <td>
                      <span className="position-badge" style={{backgroundColor: getPositionColor(player.position)}}>
                        {player.position}
                      </span>
                    </td>
                    <td>{player.name}</td>
                    <td>${player.salary.toLocaleString()}</td>
                    <td>{player.projection.toFixed(2)}</td>
                    <td>{(player.projection / player.salary * 1000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default LineupOptimizer

