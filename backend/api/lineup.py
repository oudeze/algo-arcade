"""
API endpoints for the lineup optimizer
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import sys
from pathlib import Path
import json

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from services.lineup_optimizer import solve_lineup

router = APIRouter(prefix="/api/lineup", tags=["lineup"])


class Player(BaseModel):
    name: str
    position: str
    salary: int = Field(ge=0, description="Player salary")
    projection: float = Field(ge=0, description="Projected points")


class LineupRequest(BaseModel):
    players: List[Player]
    salary_cap: int = Field(gt=0, description="Salary cap")
    positions: Dict[str, int] = Field(description="Position requirements")
    flex_positions: Optional[List[str]] = None


@router.get("/example")
def get_example():
    """Get example lineup data."""
    try:
        data_path = Path(__file__).parent.parent.parent / "data" / "lineup_example.json"
        with open(data_path) as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/solve")
def solve_lineup_problem(request: LineupRequest):
    """Solve a lineup optimization problem."""
    try:
        players_dict = [player.dict() for player in request.players]
        result = solve_lineup(
            players=players_dict,
            salary_cap=request.salary_cap,
            positions=request.positions,
            flex_positions=request.flex_positions
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

