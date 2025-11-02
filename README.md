# Algorithms Arcade

A collection of real algorithms solving real problems.

## What is this?

Three mini-apps that use actual algorithms to solve everyday problems:
- **Errand Route Optimizer**: TSP with time windows (A*, 2-opt, simulated annealing)
- **Budget & Packing Planner**: Knapsack DP + multi-constraint ILP
- **Fantasy/Props Lineup Optimizer**: ILP for optimal lineups

Might add a game AI thing too (minimax/MCTS).

## Tech Stack

- **Backend**: Python + FastAPI
- **Frontend**: React + TypeScript + Vite
- **Algorithms**: OR-Tools, PuLP, NumPy

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
      opt/        # Knapsack, TSP, etc
      meta/       # GA, simulated annealing, etc
    services/     # Business logic
    tests/        # Tests (eventually)
  frontend/
    src/
      apps/       # Route, packing, lineup apps
      components/ # Reusable UI stuff
  data/          # Sample data files
```

## TODO

- [x] Basic scaffolding, FastAPI + React setup, sample data, CI
- [ ]  Knapsack DP + UI
- [ ]  TSP + map visualization
- [ ] Lineup optimizer + results table
- [ ] Cleanup (save/load, export, perf notes)
- [ ] Final README with examples and guide

## Sample Data

`data/` for example JSON files.


