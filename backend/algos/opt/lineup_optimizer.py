"""
ILP Lineup Optimizer using OR-Tools CP-SAT
Solves fantasy lineup optimization with position and salary constraints
"""
from typing import List, Dict, Tuple, Optional
from ortools.sat.python import cp_model


def optimize_lineup(
    players: List[Dict],
    salary_cap: int,
    positions: Dict[str, int],
    flex_positions: List[str] = None
) -> Tuple[List[Dict], float, int, Dict]:
    """
    Optimize fantasy lineup using ILP.
    
    Args:
        players: List of players with 'name', 'position', 'salary', 'projection'
        salary_cap: Maximum total salary
        positions: Dict of position -> required count (e.g., {'QB': 1, 'RB': 2})
        flex_positions: List of positions that can fill FLEX (default: ['RB', 'WR', 'TE'])
        
    Returns:
        Tuple of (selected_players, total_projection, total_salary, constraint_info)
    """
    if flex_positions is None:
        flex_positions = ['RB', 'WR', 'TE']
    
    n = len(players)
    if n == 0:
        return [], 0.0, 0, {}
    
    # Create model
    model = cp_model.CpModel()
    
    # Decision variables: x[i] = 1 if player i is selected, 0 otherwise
    x = [model.NewBoolVar(f'player_{i}') for i in range(n)]
    
    # Objective: maximize total projection
    objective = model.NewIntVar(0, int(sum(p['projection'] * 100 for p in players)), 'objective')
    model.Add(objective == sum(int(players[i]['projection'] * 100) * x[i] for i in range(n)))
    model.Maximize(objective)
    
    # Constraint: salary cap
    model.Add(sum(players[i]['salary'] * x[i] for i in range(n)) <= salary_cap)
    
    # Position constraints
    position_counts = {}
    for pos, required in positions.items():
        if pos == 'FLEX':
            # FLEX can be filled by any position in flex_positions
            model.Add(sum(x[i] for i in range(n) if players[i]['position'] in flex_positions) >= required)
            position_counts[pos] = required
        else:
            # Exact count for specific positions
            model.Add(sum(x[i] for i in range(n) if players[i]['position'] == pos) == required)
            position_counts[pos] = required
    
    # Solve
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        selected_players = []
        total_projection = 0.0
        total_salary = 0
        
        for i in range(n):
            if solver.Value(x[i]) == 1:
                selected_players.append(players[i])
                total_projection += players[i]['projection']
                total_salary += players[i]['salary']
        
        # Build constraint info
        constraint_info = {
            "status": "optimal" if status == cp_model.OPTIMAL else "feasible",
            "salary_used": total_salary,
            "salary_remaining": salary_cap - total_salary,
            "salary_used_pct": (total_salary / salary_cap * 100) if salary_cap > 0 else 0,
            "position_counts": {}
        }
        
        # Count positions in solution
        for pos in positions.keys():
            if pos == 'FLEX':
                count = sum(1 for p in selected_players if p['position'] in flex_positions)
            else:
                count = sum(1 for p in selected_players if p['position'] == pos)
            constraint_info["position_counts"][pos] = count
        
        return selected_players, total_projection, total_salary, constraint_info
    else:
        # No solution found
        return [], 0.0, 0, {
            "status": "infeasible",
            "error": "No valid lineup found with given constraints"
        }

