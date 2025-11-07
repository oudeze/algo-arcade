"""
Service for the route planner app
Handles TSP optimization for errand routing
"""
from typing import List, Dict, Tuple, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from algos.opt.tsp_2opt import tsp_2opt, calculate_distance
from algos.meta.simulated_annealing import tsp_simulated_annealing


def geocode_address(address: str) -> Tuple[float, float]:
    """
    Convert address to coordinates.
    For MVP, we'll use a simple hash-based approach to generate fake coordinates.
    In production, you'd use a geocoding API like Google Maps, OpenStreetMap, etc.
    """
    # Simple hash-based coordinate generation for demo
    # In real app, use actual geocoding service
    hash_val = hash(address) % 1000000
    lat = 37.7749 + (hash_val % 1000) / 10000  # San Francisco area
    lon = -122.4194 + ((hash_val // 1000) % 1000) / 10000
    return (lat, lon)


def solve_route(
    home: str,
    stops: List[Dict],
    algorithm: str = "2opt"
) -> Dict:
    """
    Solve route optimization problem.
    
    Args:
        home: Home address
        stops: List of stops with name, address, hours, duration
        algorithm: "2opt" or "simulated_annealing"
        
    Returns:
        Result dict with optimized route and stats
    """
    # Geocode all locations
    home_coord = geocode_address(home)
    stop_coords = [geocode_address(stop['address']) for stop in stops]
    
    # Combine home + stops (home is index 0, stops are 1..n)
    all_coords = [home_coord] + stop_coords
    n = len(all_coords)
    
    if n < 2:
        return {
            "route": [0],
            "total_distance": 0.0,
            "route_order": [0],
            "algorithm": algorithm
        }
    
    # Solve TSP (excluding return to home for now, or include it)
    # For errands, we typically want to return home, so add home at the end
    if algorithm == "2opt":
        route, distance = tsp_2opt(all_coords)
    elif algorithm == "simulated_annealing":
        route, distance = tsp_simulated_annealing(all_coords)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}")
    
    # Ensure route starts at home (index 0)
    if route[0] != 0:
        # Rotate route to start at home
        start_idx = route.index(0)
        route = route[start_idx:] + route[:start_idx]
    
    # Optionally add return to home
    if route[-1] != 0:
        route.append(0)
        distance += calculate_distance(all_coords[route[-2]], all_coords[0])
    
    # Build route details
    route_stops = []
    for idx in route:
        if idx == 0:
            route_stops.append({
                "name": "Home",
                "address": home,
                "index": 0,
                "coordinates": all_coords[0]
            })
        else:
            stop_idx = idx - 1
            route_stops.append({
                "name": stops[stop_idx]["name"],
                "address": stops[stop_idx]["address"],
                "hours": stops[stop_idx].get("hours"),
                "duration": stops[stop_idx].get("duration", 0),
                "index": idx,
                "coordinates": all_coords[idx]
            })
    
    return {
        "route": route_stops,
        "total_distance": distance,
        "route_order": route,
        "coordinates": all_coords,
        "algorithm": algorithm
    }


def compare_algorithms(
    home: str,
    stops: List[Dict]
) -> Dict:
    """Compare 2-opt vs Simulated Annealing."""
    result_2opt = solve_route(home, stops, "2opt")
    result_sa = solve_route(home, stops, "simulated_annealing")
    
    return {
        "2opt": result_2opt,
        "simulated_annealing": result_sa,
        "comparison": {
            "distance_difference": result_2opt["total_distance"] - result_sa["total_distance"],
            "improvement_pct": ((result_2opt["total_distance"] - result_sa["total_distance"]) / result_2opt["total_distance"] * 100) if result_2opt["total_distance"] > 0 else 0,
            "sa_better": result_sa["total_distance"] < result_2opt["total_distance"]
        }
    }

