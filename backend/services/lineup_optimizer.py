"""
Service for the lineup optimizer app
Handles fantasy lineup optimization using ILP
"""
from typing import List, Dict, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from algos.opt.lineup_optimizer import optimize_lineup


def solve_lineup(
    players: List[Dict],
    salary_cap: int,
    positions: Dict[str, int],
    flex_positions: Optional[List[str]] = None
) -> Dict:
    """
    Solve lineup optimization problem.
    
    Args:
        players: List of players with name, position, salary, projection
        salary_cap: Maximum total salary
        positions: Dict of position -> required count
        flex_positions: Optional list of positions that can fill FLEX
        
    Returns:
        Result dict with optimized lineup and stats
    """
    selected_players, total_projection, total_salary, constraint_info = optimize_lineup(
        players=players,
        salary_cap=salary_cap,
        positions=positions,
        flex_positions=flex_positions
    )
    
    return {
        "lineup": selected_players,
        "total_projection": total_projection,
        "total_salary": total_salary,
        "constraint_info": constraint_info
    }

