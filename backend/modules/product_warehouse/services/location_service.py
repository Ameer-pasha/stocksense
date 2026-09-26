"""
Location Service Layer for Member 2.
Enforces hierarchical tree structures inside warehouses.
"""

from typing import List, Dict, Any
from ..exceptions.inventory_exceptions import (
    LocationNotFoundError,
    WarehouseNotFoundError,
    InvalidLocationHierarchyError,
    InventoryModuleError
)
from ..interfaces.shared_db_interface import ILocationRepository, IWarehouseRepository

VALID_LOCATION_TYPES = {"zone", "rack", "shelf", "bin", "bay"}

class LocationService:
    def __init__(self, location_repo: ILocationRepository, warehouse_repo: IWarehouseRepository):
        self.location_repo = location_repo
        self.warehouse_repo = warehouse_repo

    def get_locations_tree(self, warehouse_id: int) -> List[Dict[str, Any]]:
        # Verify warehouse exists
        wh = self.warehouse_repo.get_by_id(warehouse_id)
        if not wh:
            raise WarehouseNotFoundError(warehouse_id)

        locations = self.location_repo.list_by_warehouse(warehouse_id)
        lookup = {loc["id"]: {**loc, "children": []} for loc in locations}
        tree = []

        for loc in lookup.values():
            parent_id = loc.get("parent_id")
            if parent_id and parent_id in lookup:
                lookup[parent_id]["children"].append(loc)
            else:
                tree.append(loc)
        return tree

    def get_location(self, location_id: int) -> Dict[str, Any]:
        loc = self.location_repo.get_by_id(location_id)
        if not loc:
            raise LocationNotFoundError(location_id)
        return loc

    def create_location(self, data: Dict[str, Any]) -> Dict[str, Any]:
        warehouse_id = data.get("warehouse_id")
        parent_id = data.get("parent_id")
        name = data.get("name", "").strip()
        code = data.get("code", "").strip().upper()
        loc_type = data.get("type", "").strip().lower()

        if not warehouse_id:
            raise InventoryModuleError("Warehouse ID is required.")
        if not self.warehouse_repo.get_by_id(warehouse_id):
            raise WarehouseNotFoundError(warehouse_id)

        if not name or not code:
            raise InventoryModuleError("Location name and code are required.")

        if loc_type not in VALID_LOCATION_TYPES:
            raise InventoryModuleError(f"Type '{loc_type}' invalid. Allowed: {sorted(list(VALID_LOCATION_TYPES))}")

        # Check Parent validity
        parent_path = ""
        if parent_id:
            parent = self.location_repo.get_by_id(parent_id)
            if not parent:
                raise LocationNotFoundError(parent_id)
            if parent["warehouse_id"] != warehouse_id:
                raise InvalidLocationHierarchyError("Parent location belongs to a different warehouse.")
            parent_path = parent.get("full_path") or parent["name"]

        # Check code uniqueness within warehouse
        existing = self.location_repo.get_by_code(warehouse_id, code)
        if existing:
            raise InventoryModuleError(f"Location code '{code}' already exists in this warehouse.")

        full_path = f"{parent_path} > {name}" if parent_path else name

        clean_payload = {
            "warehouse_id": warehouse_id,
            "parent_id": parent_id,
            "name": name,
            "code": code,
            "type": loc_type,
            "full_path": full_path,
            "is_active": True
        }
        return self.location_repo.create(clean_payload)

    def update_location(self, location_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        self.get_location(location_id)
        return self.location_repo.update(location_id, data)

    def set_location_status(self, location_id: int, is_active: bool) -> bool:
        self.get_location(location_id)
        return self.location_repo.set_status(location_id, is_active)
