import { useState, useRef, useEffect } from 'react'
import './RoutePlanner.css'

interface Stop {
  name: string
  address: string
  hours?: { open: string; close: string }
  duration: number
}

interface RouteStop {
  name: string
  address: string
  hours?: { open: string; close: string }
  duration: number
  index: number
  coordinates: [number, number]
}

interface RouteResult {
  route: RouteStop[]
  total_distance: number
  route_order: number[]
  coordinates: [number, number][]
  algorithm: string
}

interface ComparisonResult {
  '2opt': RouteResult
  simulated_annealing: RouteResult
  comparison: {
    distance_difference: number
    improvement_pct: number
    sa_better: boolean
  }
}

function RoutePlanner() {
  const [home, setHome] = useState('123 Main St, City, State')
  const [stops, setStops] = useState<Stop[]>([
    { name: 'Grocery Store', address: '456 Oak Ave, City, State', hours: { open: '09:00', close: '21:00' }, duration: 30 },
    { name: 'Gym', address: '789 Pine Rd, City, State', hours: { open: '06:00', close: '22:00' }, duration: 60 }
  ])
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadExample = async () => {
    try {
      const response = await fetch('/api/route/example')
      const data = await response.json()
      setHome(data.home)
      setStops(data.stops)
    } catch (err) {
      console.error('Failed to load example:', err)
    }
  }

  const solveComparison = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/route/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home,
          stops
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to solve')
      }
      
      const result = await response.json()
      setComparison(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addStop = () => {
    setStops([...stops, { name: '', address: '', duration: 0 }])
  }

  const updateStop = (index: number, field: keyof Stop, value: string | number | { open: string; close: string }) => {
    const newStops = [...stops]
    newStops[index] = { ...newStops[index], [field]: value }
    setStops(newStops)
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const drawRoute = (result: RouteResult, color: string) => {
    const canvas = canvasRef.current
    if (!canvas || !result.coordinates || result.coordinates.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Find bounds
    const lats = result.coordinates.map(c => c[0])
    const lons = result.coordinates.map(c => c[1])
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    const latRange = maxLat - minLat || 0.01
    const lonRange = maxLon - minLon || 0.01

    // Convert coordinates to canvas positions
    const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - 2 * padding)
    const toY = (lat: number) => padding + ((maxLat - lat) / latRange) * (height - 2 * padding)

    // Draw route
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let i = 0; i < result.route_order.length; i++) {
      const idx = result.route_order[i]
      const coord = result.coordinates[idx]
      const x = toX(coord[1])
      const y = toY(coord[0])
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw points
    result.route.forEach((stop) => {
      const coord = stop.coordinates
      const x = toX(coord[1])
      const y = toY(coord[0])
      
      ctx.fillStyle = stop.name === 'Home' ? '#28a745' : '#007bff'
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // Label
      ctx.fillStyle = '#333'
      ctx.font = '12px sans-serif'
      ctx.fillText(stop.name, x + 8, y - 8)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (comparison) {
      // Draw both routes with different colors
      drawRoute(comparison['2opt'], '#6c757d')
      drawRoute(comparison.simulated_annealing, '#007bff')
    }
  }, [comparison])

  return (
    <div className="route-planner">
      <h1>Errand Route Optimizer</h1>
      <p className="subtitle">TSP optimization: 2-opt vs Simulated Annealing</p>

      <div className="controls">
        <button onClick={loadExample} className="btn-secondary">Load Example</button>
        <button onClick={solveComparison} disabled={loading} className="btn-primary">
          {loading ? 'Optimizing...' : 'Compare Algorithms'}
        </button>
      </div>

      <div className="home-section">
        <label>Home Address:</label>
        <input
          type="text"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          placeholder="Your home address"
          className="home-input"
        />
      </div>

      <div className="stops-section">
        <h2>Stops</h2>
        <button onClick={addStop} className="btn-small">+ Add Stop</button>
        <div className="stops-list">
          {stops.map((stop, index) => (
            <div key={index} className="stop-item">
              <input
                type="text"
                value={stop.name}
                onChange={(e) => updateStop(index, 'name', e.target.value)}
                placeholder="Stop name"
                className="stop-name"
              />
              <input
                type="text"
                value={stop.address}
                onChange={(e) => updateStop(index, 'address', e.target.value)}
                placeholder="Address"
                className="stop-address"
              />
              <input
                type="number"
                value={stop.duration}
                onChange={(e) => updateStop(index, 'duration', Number(e.target.value))}
                placeholder="Duration (min)"
                className="stop-duration"
                min="0"
              />
              <button onClick={() => removeStop(index)} className="btn-remove">×</button>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {comparison && (
        <div className="results">
          <h2>Route Comparison</h2>
          
          <div className="map-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="route-map"
            />
            <div className="map-legend">
              <div><span className="legend-dot" style={{backgroundColor: '#6c757d'}}></span> 2-opt</div>
              <div><span className="legend-dot" style={{backgroundColor: '#007bff'}}></span> Simulated Annealing</div>
              <div><span className="legend-dot" style={{backgroundColor: '#28a745'}}></span> Home</div>
            </div>
          </div>

          <div className="comparison-summary">
            <div className={`summary-card ${!comparison.comparison.sa_better ? 'winner' : ''}`}>
              <h3>2-opt Algorithm</h3>
              <div className="stats">
                <div>Distance: <strong>{comparison['2opt'].total_distance.toFixed(2)}</strong> units</div>
                <div>Stops: {comparison['2opt'].route.length - 1}</div>
              </div>
              <div className="route-list">
                <strong>Route:</strong>
                <ol>
                  {comparison['2opt'].route.map((stop) => (
                    <li key={stop.index}>{stop.name} {stop.address && `(${stop.address})`}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={`summary-card ${comparison.comparison.sa_better ? 'winner' : ''}`}>
              <h3>Simulated Annealing</h3>
              <div className="stats">
                <div>Distance: <strong>{comparison.simulated_annealing.total_distance.toFixed(2)}</strong> units</div>
                <div>Stops: {comparison.simulated_annealing.route.length - 1}</div>
              </div>
              <div className="route-list">
                <strong>Route:</strong>
                <ol>
                  {comparison.simulated_annealing.route.map((stop) => (
                    <li key={stop.index}>{stop.name} {stop.address && `(${stop.address})`}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="improvement">
            {comparison.comparison.sa_better ? (
              <p>
                Simulated Annealing is <strong>{Math.abs(comparison.comparison.improvement_pct).toFixed(1)}%</strong> better
                (saves {comparison.comparison.distance_difference.toFixed(2)} units)
              </p>
            ) : (
              <p>
                2-opt matched or beat Simulated Annealing
                {comparison.comparison.distance_difference > 0 && ` (${comparison.comparison.distance_difference.toFixed(2)} units better)`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutePlanner

