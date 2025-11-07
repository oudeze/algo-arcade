"""
API endpoints for the route planner
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import sys
from pathlib import Path
import json

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from services.route_planner import solve_route, compare_algorithms

router = APIRouter(prefix="/api/route", tags=["route"])


class Stop(BaseModel):
    name: str
    address: str
    hours: Optional[Dict[str, str]] = None
    duration: int = Field(default=0, ge=0, description="Duration in minutes")


class RouteRequest(BaseModel):
    home: str
    stops: List[Stop]
    algorithm: str = Field(default="2opt", pattern="^(2opt|simulated_annealing)$")


@router.get("/example")
def get_example():
    """Get example route data."""
    try:
        data_path = Path(__file__).parent.parent.parent / "data" / "route_example.json"
        with open(data_path) as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/solve")
def solve_route_problem(request: RouteRequest):
    """Solve a route optimization problem."""
    try:
        stops_dict = [stop.dict() for stop in request.stops]
        result = solve_route(
            home=request.home,
            stops=stops_dict,
            algorithm=request.algorithm
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
def compare_route_algorithms(request: RouteRequest):
    """Compare 2-opt vs Simulated Annealing for route optimization."""
    try:
        stops_dict = [stop.dict() for stop in request.stops]
        result = compare_algorithms(
            home=request.home,
            stops=stops_dict
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

