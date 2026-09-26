"""
Reorder Rules Service Layer for Member 2.
Enforces Min/Max inventory safety threshold rules.
"""

from typing import List, Dict, Any, Optional
from ..exceptions.inventory_exceptions import (
    ReorderRuleValidationError,
    ProductNotFoundError,
    LocationNotFoundError
)
from ..interfaces.shared_db_interface import (
    IReorderRuleRepository,
    IProductRepository,
    ILocationRepository,
    IStockAvailabilityReader
)

class ReorderService:
    def __init__(
        self,
        reorder_repo: IReorderRuleRepository,
        product_repo: IProductRepository,
        location_repo: ILocationRepository,
        stock_reader: Optional[IStockAvailabilityReader] = None
    ):
        self.reorder_repo = reorder_repo
        self.product_repo = product_repo
        self.location_repo = location_repo
        self.stock_reader = stock_reader

    def list_rules(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        rules = self.reorder_repo.list(filters)
        
        # Enrich rules with real-time stock reading if reader available
        for rule in rules:
            product = self.product_repo.get_by_id(rule["product_id"])
            if product:
                rule["product_name"] = product["name"]
                rule["sku"] = product["sku"]
                rule["unit"] = product["unit_of_measure"]

            if rule.get("location_id"):
                loc = self.location_repo.get_by_id(rule["location_id"])
                if loc:
                    rule["location_name"] = loc.get("full_path") or loc["name"]

            # Calculate reorder status
            current = rule.get("current_stock", 0.0)
            if current <= rule["min_quantity"]:
                rule["status"] = "breached"
            elif current >= rule["max_quantity"]:
                rule["status"] = "surplus"
            else:
                rule["status"] = "adequate"

        if filters.get("status"):
            rules = [r for r in rules if r.get("status") == filters["status"]]

        return rules

    def create_rule(self, data: Dict[str, Any]) -> Dict[str, Any]:
        product_id = data.get("product_id")
        location_id = data.get("location_id")
        min_qty = float(data.get("min_quantity", 0))
        max_qty = float(data.get("max_quantity", 0))
        reorder_qty = float(data.get("reorder_quantity", 0))

        if not self.product_repo.get_by_id(product_id):
            raise ProductNotFoundError(product_id)

        if location_id and not self.location_repo.get_by_id(location_id):
            raise LocationNotFoundError(location_id)

        if min_qty <= 0:
            raise ReorderRuleValidationError("Minimum quantity must be greater than 0.")
        if max_qty <= min_qty:
            raise ReorderRuleValidationError(f"Maximum quantity ({max_qty}) must exceed minimum quantity ({min_qty}).")
        if reorder_qty <= 0:
            raise ReorderRuleValidationError("Reorder quantity must be greater than 0.")

        clean_payload = {
            "product_id": product_id,
            "location_id": location_id,
            "min_quantity": min_qty,
            "max_quantity": max_qty,
            "reorder_quantity": reorder_qty,
            "is_active": True
        }
        return self.reorder_repo.create(clean_payload)

    def delete_rule(self, rule_id: int) -> bool:
        return self.reorder_repo.delete(rule_id)
