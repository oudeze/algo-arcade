"""
Service for the packing planner app
Handles the business logic for knapsack optimization
"""
from typing import List, Dict, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from algos.opt.knapsack_dp import knapsack_dp
from algos.opt.knapsack_greedy import knapsack_greedy


def solve_packing(
    items: List[Dict],
    budget: float,
    max_weight: float,
    category_limit: Optional[Dict[str, int]] = None,
    algorithm: str = "dp"
) -> Dict:
    """
    Solve packing problem using specified algorithm.
    
    Args:
        items: List of items with name, value, weight, cost, category
        budget: Budget constraint
        max_weight: Weight constraint
        category_limit: Optional category limits
        algorithm: "dp" or "greedy"
        
    Returns:
        Result dict with selected items, totals, and stats
    """
    if algorithm == "dp":
        selected, value, cost, weight = knapsack_dp(items, budget, max_weight, category_limit)
    elif algorithm == "greedy":
        selected, value, cost, weight = knapsack_greedy(items, budget, max_weight, category_limit)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    return {
        "selected_items": selected,
        "total_value": value,
        "total_cost": cost,
        "total_weight": weight,
        "budget_used_pct": (cost / budget * 100) if budget > 0 else 0,
        "weight_used_pct": (weight / max_weight * 100) if max_weight > 0 else 0,
        "algorithm": algorithm
    }


def compare_algorithms(
    items: List[Dict],
    budget: float,
    max_weight: float,
    category_limit: Optional[Dict[str, int]] = None
) -> Dict:
    """
    Compare DP vs Greedy approaches.
    
    Returns:
        Dict with both results and comparison stats
    """
    dp_result = solve_packing(items, budget, max_weight, category_limit, "dp")
    greedy_result = solve_packing(items, budget, max_weight, category_limit, "greedy")
    
    dp_value = dp_result["total_value"]
    greedy_value = greedy_result["total_value"]
    
    improvement = ((dp_value - greedy_value) / greedy_value * 100) if greedy_value > 0 else 0
    
    return {
        "dp": dp_result,
        "greedy": greedy_result,
        "comparison": {
            "value_difference": dp_value - greedy_value,
            "improvement_pct": improvement,
            "dp_better": dp_value > greedy_value
        }
    }

