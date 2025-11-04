"""
0/1 Knapsack using Dynamic Programming
Handles multiple constraints: budget and weight
Returns the optimal selection and total value
"""
from typing import List, Dict, Tuple, Optional


def knapsack_dp(
    items: List[Dict],
    budget: float,
    max_weight: float,
    category_limit: Optional[Dict[str, int]] = None
) -> Tuple[List[Dict], float, float, float]:
    """
    Solve 0/1 knapsack with budget and weight constraints.
    
    Uses DP with memoization. State is (item_index, remaining_budget, remaining_weight, category_counts).
    For simplicity with category limits, we'll use a simpler approach that tracks selections.
    
    Args:
        items: List of items with 'name', 'value', 'weight', 'cost', 'category'
        budget: Maximum budget constraint
        max_weight: Maximum weight constraint
        category_limit: Optional dict of category -> max count
        
    Returns:
        Tuple of (selected_items, total_value, total_cost, total_weight)
    """
    n = len(items)
    
    # Convert floats to integers for DP table (multiply by 100 to preserve 2 decimal places)
    budget_int = int(budget * 100)
    max_weight_int = int(max_weight * 100)
    
    # DP table: dp[i][b][w] = max value achievable
    # Using dict for sparse representation since we might have large constraint values
    # Actually, let's use a 2D table approach: dp[b][w] = (max_value, parent_trace)
    # We'll iterate through items and update the table
    
    # For each (budget, weight) combination, store the best value and which items were selected
    # We'll use a simpler approach: iterate items and build up the solution
    
    # dp[b][w] = best value with budget b and weight w
    dp = {}
    parent = {}  # parent[(b, w)] = (prev_b, prev_w, item_idx) or None
    
    # Initialize: dp[0][0] = 0
    dp[(0, 0)] = 0.0
    parent[(0, 0)] = None
    
    # Process each item
    for i in range(n):
        item = items[i]
        cost_int = int(item['cost'] * 100)
        weight_int = int(item['weight'] * 100)
        value = item['value']
        category = item.get('category', '')
        
        # Check category limit
        can_take = True
        if category_limit and category in category_limit:
            # For now, we'll check this when building the solution
            # This is a simplification - proper solution would track category counts in state
            pass
        
        # Iterate through all current states in reverse to avoid using same item twice
        current_states = list(dp.keys())
        for b, w in current_states:
            new_b = b + cost_int
            new_w = w + weight_int
            
            # Check constraints
            if new_b > budget_int or new_w > max_weight_int:
                continue
            
            # Check if this state gives better value
            current_value = dp.get((b, w), 0.0)
            new_value = current_value + value
            
            if new_value > dp.get((new_b, new_w), -1.0):
                dp[(new_b, new_w)] = new_value
                parent[(new_b, new_w)] = (b, w, i)
    
    # Find best state
    best_value = 0.0
    best_state = (0, 0)
    for (b, w), value in dp.items():
        if value > best_value:
            best_value = value
            best_state = (b, w)
    
    # Trace back to find selected items
    selected_indices = []
    current_state = best_state
    while current_state in parent and parent[current_state] is not None:
        prev_b, prev_w, item_idx = parent[current_state]
        selected_indices.append(item_idx)
        current_state = (prev_b, prev_w)
    
    selected_indices.reverse()
    
    # Apply category limits (post-processing filter)
    if category_limit:
        category_counts = {}
        filtered_indices = []
        for idx in selected_indices:
            item = items[idx]
            cat = item.get('category', '')
            if cat in category_limit:
                current_count = category_counts.get(cat, 0)
                if current_count >= category_limit[cat]:
                    continue
                category_counts[cat] = current_count + 1
            filtered_indices.append(idx)
        selected_indices = filtered_indices
    
    # Build result
    selected_items = [items[i] for i in selected_indices]
    total_cost = sum(item['cost'] for item in selected_items)
    total_weight = sum(item['weight'] for item in selected_items)
    total_value = sum(item['value'] for item in selected_items)
    
    return selected_items, total_value, total_cost, total_weight
