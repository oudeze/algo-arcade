# Algorithms Arcade

A collection of real algorithms solving real problems. Because sometimes you just need to optimize your Saturday errands or figure out what to pack for a trip.

## What is this?

Three mini-apps that use actual algorithms to solve everyday problems:
- **Errand Route Optimizer**: TSP with 2-opt and simulated annealing
- **Budget & Packing Planner**: Knapsack DP vs Greedy comparison
- **Fantasy/Props Lineup Optimizer**: ILP for optimal lineups

Might add a game AI thing too (minimax/MCTS) but that's later.

## Tech Stack

- **Backend**: Python + FastAPI
- **Frontend**: React + TypeScript + Vite
- **Algorithms**: OR-Tools (CP-SAT), NumPy
- **Maybe later**: Some C++ via pybind11 if things get slow

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
algorithms-arcade/
  backend/
    api/          # FastAPI endpoints
    algos/        # Algorithm implementations
      graphs/     # A*, Dijkstra, etc
      opt/        # Knapsack, TSP, lineup, etc
      meta/       # GA, simulated annealing, etc
    services/     # Business logic
    tests/        # Tests (eventually)
  frontend/
    src/
      apps/       # Route, packing, lineup apps
      components/ # Reusable UI stuff
  data/          # Sample data files
```

## Apps

### 1. Budget & Packing Planner

**Problem**: You have a budget and weight limit. Which items should you pack to maximize value?

**Algorithms**:
- **Dynamic Programming (0/1 Knapsack)**: Optimal solution, handles multiple constraints
- **Greedy**: Fast but not always optimal (sorts by value/cost ratio)

**When to use**:
- **DP**: When you need the absolute best solution and have reasonable constraint sizes (< 1000 items, budget/weight < 10000)
- **Greedy**: When you have thousands of items or need instant results (good enough is fine)

**Example**: Weekend trip packing - laptop, camera, clothes, etc. DP finds the optimal combo, greedy gets you 90% there in milliseconds.

**Performance**: 
- DP: O(n × budget × weight) - can be slow for large inputs
- Greedy: O(n log n) - always fast

### 2. Errand Route Optimizer

**Problem**: You have errands to run. What's the shortest route that hits all stops?

**Algorithms**:
- **2-opt**: Local search, improves a route by swapping edges
- **Simulated Annealing**: Metaheuristic that accepts worse solutions early to escape local optima

**When to use**:
- **2-opt**: When you have < 20 stops and want a quick decent solution
- **Simulated Annealing**: When you have more stops or want a better solution (takes longer but finds better routes)

**Example**: Saturday errands - grocery store, gym, pharmacy. Both find routes, but SA usually finds a slightly shorter one.

**Performance**:
- 2-opt: O(n²) per iteration, usually converges in < 100 iterations
- SA: O(n²) per iteration, runs for ~10000 iterations (slower but better)

**Note**: Currently uses Euclidean distance (straight-line). In production, you'd use real road distances via Google Maps API or similar.

### 3. Fantasy Lineup Optimizer

**Problem**: You have a salary cap and position requirements. Which players maximize projected points?

**Algorithms**:
- **Integer Linear Programming (ILP)**: Uses OR-Tools CP-SAT solver

**When to use**:
- **ILP**: Always. This is the right tool for constraint optimization problems. Handles salary caps, position limits, and other rules perfectly.

**Example**: Daily fantasy sports - pick 1 QB, 2 RB, 3 WR, 1 TE, 1 FLEX, 1 DST while staying under $50k salary. ILP finds the optimal lineup.

**Performance**:
- ILP: Depends on problem size, but OR-Tools is pretty fast. Usually solves in < 1 second for < 500 players.

**Constraints handled**:
- Salary cap (hard constraint)
- Position requirements (exact counts)
- FLEX positions (can be RB, WR, or TE)

## Algorithm Comparison Guide

### Knapsack Problems
- **Small inputs (< 100 items)**: Use DP for optimal solution
- **Large inputs (> 1000 items)**: Use Greedy or approximation algorithms
- **Multiple constraints**: DP handles budget + weight + category limits

### TSP / Route Optimization
- **Small routes (< 10 stops)**: Exact algorithms (branch and bound) or 2-opt
- **Medium routes (10-50 stops)**: 2-opt or Simulated Annealing
- **Large routes (> 50 stops)**: Metaheuristics (SA, Genetic Algorithms) or approximation algorithms
- **With time windows**: Need CP-SAT or specialized solvers

### Constraint Optimization
- **Linear constraints + integer variables**: ILP (OR-Tools, PuLP)
- **Non-linear or complex constraints**: Metaheuristics (GA, SA)
- **Small search space**: Exhaustive search or DP
- **Large search space**: Heuristics or metaheuristics

## Usage Examples

### Packing Planner

```json
{
  "budget": 500,
  "max_weight": 50,
  "items": [
    {"name": "Laptop", "value": 10, "weight": 3, "cost": 50, "category": "electronics"},
    {"name": "Camera", "value": 9, "weight": 1, "cost": 150, "category": "electronics"}
  ]
}
```

Click "Compare Algorithms" to see DP vs Greedy. DP usually finds 5-10% better solutions.

### Route Optimizer

```json
{
  "home": "123 Main St, City, State",
  "stops": [
    {"name": "Grocery Store", "address": "456 Oak Ave", "duration": 30},
    {"name": "Gym", "address": "789 Pine Rd", "duration": 60}
  ]
}
```

Both algorithms find routes. SA typically finds routes 2-5% shorter but takes longer.

### Lineup Optimizer

```json
{
  "salary_cap": 50000,
  "positions": {"QB": 1, "RB": 2, "WR": 3, "TE": 1, "FLEX": 1, "DST": 1},
  "players": [
    {"name": "Player A", "position": "QB", "salary": 8000, "projection": 22.5}
  ]
}
```

ILP finds the optimal lineup that satisfies all constraints and maximizes points.

## Performance Notes

- **Knapsack DP**: Can handle ~100 items with budget/weight up to ~10k each. Beyond that, use greedy.
- **TSP 2-opt**: Fast for < 20 stops, decent solutions in < 1 second.
- **TSP Simulated Annealing**: Slower (1-5 seconds) but finds better solutions for 20+ stops.
- **Lineup ILP**: Very fast, handles 500+ players in < 1 second.

## When to Use Which Algorithm

**Need optimal solution + small problem?** → DP or ILP

**Need fast solution + large problem?** → Greedy or Heuristics

**Need good solution + medium problem?** → Metaheuristics (SA, GA)

**Have constraints (budget, positions, etc)?** → ILP or Constraint Programming

**Have time windows or complex rules?** → CP-SAT or specialized solvers

## Sample Data

Check out `data/` for example JSON files:
- `packing_example.json` - Sample packing problem
- `route_example.json` - Sample route with stops
- `lineup_example.json` - Sample fantasy lineup

## API Endpoints

- `GET /api/packing/example` - Get example packing data
- `POST /api/packing/compare` - Compare DP vs Greedy
- `GET /api/route/example` - Get example route data
- `POST /api/route/compare` - Compare 2-opt vs Simulated Annealing
- `GET /api/lineup/example` - Get example lineup data
- `POST /api/lineup/solve` - Solve lineup optimization

## Progress

- [x] Basic scaffolding, FastAPI + React setup, sample data, CI
- [x] Knapsack DP + UI
- [x] TSP + map visualization
- [x] Lineup optimizer + results table
- [ ] Cleanup (save/load, export, perf notes) - maybe later
- [x] Final README with examples and guide

## License

MIT (probably)
