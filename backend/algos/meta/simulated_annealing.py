"""
Simulated Annealing for TSP
Metaheuristic that accepts worse solutions early on to escape local optima
"""
from typing import List, Tuple
import math
import random
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from algos.opt.tsp_2opt import calculate_route_distance, two_opt_swap


def tsp_simulated_annealing(
    coordinates: List[Tuple[float, float]],
    initial_route: List[int] = None,
    initial_temp: float = 1000.0,
    cooling_rate: float = 0.995,
    min_temp: float = 0.1,
    max_iterations: int = 10000
) -> Tuple[List[int], float]:
    """
    Solve TSP using Simulated Annealing.
    
    Args:
        coordinates: List of (x, y) coordinates for each location
        initial_route: Optional starting route
        initial_temp: Starting temperature
        cooling_rate: Temperature reduction factor per iteration
        min_temp: Minimum temperature to stop
        max_iterations: Maximum iterations
        
    Returns:
        Tuple of (best_route, best_distance)
    """
    n = len(coordinates)
    if n < 2:
        return list(range(n)), 0.0
    
    # Initialize route
    if initial_route is None:
        route = list(range(n))
        random.shuffle(route)
    else:
        route = initial_route.copy()
    
    best_route = route.copy()
    best_distance = calculate_route_distance(route, coordinates)
    current_distance = best_distance
    
    temp = initial_temp
    iterations = 0
    
    while temp > min_temp and iterations < max_iterations:
        iterations += 1
        
        # Generate neighbor by 2-opt swap
        i = random.randint(1, n - 2)
        k = random.randint(i + 1, n - 1)
        new_route = two_opt_swap(route, i, k)
        new_distance = calculate_route_distance(new_route, coordinates)
        
        # Accept or reject
        delta = new_distance - current_distance
        
        if delta < 0 or random.random() < math.exp(-delta / temp):
            route = new_route
            current_distance = new_distance
            
            if new_distance < best_distance:
                best_route = new_route.copy()
                best_distance = new_distance
        
        # Cool down
        temp *= cooling_rate
    
    return best_route, best_distance

