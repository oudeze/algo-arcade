"""
API endpoints for the packing planner
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import sys
from pathlib import Path
import json

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from services.packing_planner import solve_packing, compare_algorithms

router = APIRouter(prefix="/api/packing", tags=["packing"])


class Item(BaseModel):
    name: str
    value: float = Field(gt=0, description="Utility value of the item")
    weight: float = Field(ge=0, description="Weight of the item")
    cost: float = Field(ge=0, description="Cost of the item")
    category: str = ""


class PackingRequest(BaseModel):
    items: List[Item]
    budget: float = Field(gt=0, description="Budget constraint")
    max_weight: float = Field(gt=0, description="Weight constraint")
    category_limit: Optional[Dict[str, int]] = None
    algorithm: str = Field(default="dp", pattern="^(dp|greedy)$")


class PackingResponse(BaseModel):
    selected_items: List[Dict]
    total_value: float
    total_cost: float
    total_weight: float
    budget_used_pct: float
    weight_used_pct: float
    algorithm: str


@router.get("/example")
def get_example():
    """Get example packing data."""
    try:
        data_path = Path(__file__).parent.parent.parent / "data" / "packing_example.json"
        with open(data_path) as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/solve", response_model=PackingResponse)
def solve_packing_problem(request: PackingRequest):
    """Solve a packing problem with the specified algorithm."""
    try:
        items_dict = [item.dict() for item in request.items]
        result = solve_packing(
            items=items_dict,
            budget=request.budget,
            max_weight=request.max_weight,
            category_limit=request.category_limit,
            algorithm=request.algorithm
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
def compare_packing_algorithms(request: PackingRequest):
    """Compare DP vs Greedy algorithms for the packing problem."""
    try:
        items_dict = [item.dict() for item in request.items]
        result = compare_algorithms(
            items=items_dict,
            budget=request.budget,
            max_weight=request.max_weight,
            category_limit=request.category_limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
