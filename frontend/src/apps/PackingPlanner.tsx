import { useState } from 'react'
import './PackingPlanner.css'

interface Item {
  name: string
  value: number
  weight: number
  cost: number
  category: string
}

interface PackingResult {
  selected_items: Item[]
  total_value: number
  total_cost: number
  total_weight: number
  budget_used_pct: number
  weight_used_pct: number
  algorithm: string
}

interface ComparisonResult {
  dp: PackingResult
  greedy: PackingResult
  comparison: {
    value_difference: number
    improvement_pct: number
    dp_better: boolean
  }
}

function PackingPlanner() {
  const [items, setItems] = useState<Item[]>([
    { name: 'Laptop', value: 10, weight: 3, cost: 50, category: 'electronics' },
    { name: 'Shoes', value: 8, weight: 2, cost: 80, category: 'clothing' },
    { name: 'Camera', value: 9, weight: 1, cost: 150, category: 'electronics' }
  ])
  const [budget, setBudget] = useState(500)
  const [maxWeight, setMaxWeight] = useState(50)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExample = async () => {
    try {
      const response = await fetch('/api/packing/example')
      const data = await response.json()
      setItems(data.items)
      setBudget(data.budget)
      setMaxWeight(data.max_weight)
    } catch (err) {
      console.error('Failed to load example:', err)
    }
  }

  const solveComparison = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/packing/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          budget,
          max_weight: maxWeight
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

  const addItem = () => {
    setItems([...items, { name: '', value: 0, weight: 0, cost: 0, category: '' }])
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <div className="packing-planner">
      <h1>Budget & Packing Planner</h1>
      <p className="subtitle">Knapsack optimization: DP vs Greedy</p>

      <div className="controls">
        <button onClick={loadExample} className="btn-secondary">Load Example</button>
        <button onClick={solveComparison} disabled={loading} className="btn-primary">
          {loading ? 'Solving...' : 'Compare Algorithms'}
        </button>
      </div>

      <div className="constraints">
        <div className="constraint">
          <label>Budget:</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            min="0"
          />
        </div>
        <div className="constraint">
          <label>Max Weight:</label>
          <input
            type="number"
            value={maxWeight}
            onChange={(e) => setMaxWeight(Number(e.target.value))}
            min="0"
          />
        </div>
      </div>

      <div className="items-section">
        <h2>Items</h2>
        <button onClick={addItem} className="btn-small">+ Add Item</button>
        <table className="items-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Weight</th>
              <th>Cost</th>
              <th>Category</th>
              <th>Ratio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateItem(index, 'value', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) => updateItem(index, 'weight', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.cost}
                    onChange={(e) => updateItem(index, 'cost', Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    placeholder="category"
                  />
                </td>
                <td className="ratio">
                  {item.cost > 0 ? (item.value / item.cost).toFixed(2) : '0.00'}
                </td>
                <td>
                  <button onClick={() => removeItem(index)} className="btn-remove">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="error">{error}</div>}

      {comparison && (
        <div className="results">
          <h2>Results Comparison</h2>
          <div className="comparison-summary">
            <div className={`summary-card ${comparison.comparison.dp_better ? 'winner' : ''}`}>
              <h3>Dynamic Programming (Optimal)</h3>
              <div className="stats">
                <div>Value: <strong>{comparison.dp.total_value.toFixed(2)}</strong></div>
                <div>Cost: ${comparison.dp.total_cost.toFixed(2)} ({comparison.dp.budget_used_pct.toFixed(1)}%)</div>
                <div>Weight: {comparison.dp.total_weight.toFixed(2)} ({comparison.dp.weight_used_pct.toFixed(1)}%)</div>
                <div>Items: {comparison.dp.selected_items.length}</div>
              </div>
              <div className="selected-items">
                <strong>Selected:</strong>
                <ul>
                  {comparison.dp.selected_items.map((item, i) => (
                    <li key={i}>{item.name} (value: {item.value}, cost: ${item.cost})</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`summary-card ${!comparison.comparison.dp_better ? 'winner' : ''}`}>
              <h3>Greedy Algorithm (Fast)</h3>
              <div className="stats">
                <div>Value: <strong>{comparison.greedy.total_value.toFixed(2)}</strong></div>
                <div>Cost: ${comparison.greedy.total_cost.toFixed(2)} ({comparison.greedy.budget_used_pct.toFixed(1)}%)</div>
                <div>Weight: {comparison.greedy.total_weight.toFixed(2)} ({comparison.greedy.weight_used_pct.toFixed(1)}%)</div>
                <div>Items: {comparison.greedy.selected_items.length}</div>
              </div>
              <div className="selected-items">
                <strong>Selected:</strong>
                <ul>
                  {comparison.greedy.selected_items.map((item, i) => (
                    <li key={i}>{item.name} (value: {item.value}, cost: ${item.cost})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="improvement">
            {comparison.comparison.dp_better ? (
              <p>
                DP is <strong>{comparison.comparison.improvement_pct.toFixed(1)}%</strong> better
                (+{comparison.comparison.value_difference.toFixed(2)} value)
              </p>
            ) : (
              <p>Greedy matched DP (rare but possible)</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PackingPlanner

