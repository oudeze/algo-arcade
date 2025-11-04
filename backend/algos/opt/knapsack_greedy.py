"""
Greedy approach to knapsack - sort by value/cost ratio and take items
Not optimal but fast and sometimes close
"""
from typing import List, Dict, Tuple


def knapsack_greedy(
    items: List[Dict],
    budget: float,
    max_weight: float,
    category_limit: Dict[str, int] = None
) -> Tuple[List[Dict], float, float, float]:
    """
    Greedy knapsack: sort by value/cost ratio and take items greedily.
    
    Args:
        items: List of items with 'name', 'value', 'weight', 'cost', 'category'
        budget: Maximum budget constraint
        max_weight: Maximum weight constraint
        category_limit: Optional dict of category -> max count
        
    Returns:
        Tuple of (selected_items, total_value, total_cost, total_weight)
    """
    # Create items with index for tracking
    indexed_items = [(i, item) for i, item in enumerate(items)]
    
    # Sort by value/cost ratio (best bang for buck)
    indexed_items.sort(key=lambda x: x[1]['value'] / x[1]['cost'] if x[1]['cost'] > 0 else 0, reverse=True)
    
    selected_items = []
    selected_indices = set()
    total_cost = 0.0
    total_weight = 0.0
    total_value = 0.0
    category_counts = {}
    
    for idx, item in indexed_items:
        cost = item['cost']
        weight = item['weight']
        value = item['value']
        category = item.get('category', '')
        
        # Check constraints
        if total_cost + cost > budget:
            continue
        if total_weight + weight > max_weight:
            continue
        
        # Check category limit
        if category_limit and category in category_limit:
            current_count = category_counts.get(category, 0)
            if current_count >= category_limit[category]:
                continue
        
        # Take it!
        selected_items.append(item)
        selected_indices.add(idx)
        total_cost += cost
        total_weight += weight
        total_value += value
        
        if category:
            category_counts[category] = category_counts.get(category, 0) + 1
    
    return selected_items, total_value, total_cost, total_weight

