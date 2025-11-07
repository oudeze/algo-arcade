"""
2-opt algorithm for TSP
Simple local search that improves a route by swapping edges
"""
from typing import List, Tuple
import math


def calculate_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """Calculate Euclidean distance between two coordinates."""
    return math.sqrt((coord1[0] - coord2[0])**2 + (coord1[1] - coord2[1])**2)


def calculate_route_distance(route: List[int], coordinates: List[Tuple[float, float]]) -> float:
    """Calculate total distance of a route."""
    if len(route) < 2:
        return 0.0
    
    total = 0.0
    for i in range(len(route)):
        j = (i + 1) % len(route)
        total += calculate_distance(coordinates[route[i]], coordinates[route[j]])
    return total


def two_opt_swap(route: List[int], i: int, k: int) -> List[int]:
    """Perform 2-opt swap: reverse the segment between i and k."""
    new_route = route[:i] + route[i:k+1][::-1] + route[k+1:]
    return new_route


def tsp_2opt(
    coordinates: List[Tuple[float, float]],
    initial_route: List[int] = None,
    max_iterations: int = 1000
) -> Tuple[List[int], float]:
    """
    Solve TSP using 2-opt local search.
    
    Args:
        coordinates: List of (x, y) coordinates for each location
        initial_route: Optional starting route (defaults to [0, 1, 2, ...])
        max_iterations: Maximum iterations to run
        
    Returns:
        Tuple of (best_route, best_distance)
    """
    n = len(coordinates)
    if n < 2:
        return list(range(n)), 0.0
    
    # Start with initial route (or simple sequential if not provided)
    if initial_route is None:
        route = list(range(n))
    else:
        route = initial_route.copy()
    
    best_route = route.copy()
    best_distance = calculate_route_distance(route, coordinates)
    
    improved = True
    iterations = 0
    
    while improved and iterations < max_iterations:
        improved = False
        iterations += 1
        
        for i in range(1, n - 1):
            for k in range(i + 1, n):
                # Try 2-opt swap
                new_route = two_opt_swap(route, i, k)
                new_distance = calculate_route_distance(new_route, coordinates)
                
                if new_distance < best_distance:
                    best_route = new_route
                    best_distance = new_distance
                    route = new_route
                    improved = True
                    break
            
            if improved:
                break
    
    return best_route, best_distance

