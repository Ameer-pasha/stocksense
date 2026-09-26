"""
Warehouse Service Layer for Member 2.
"""

from typing import List, Dict, Any
from ..exceptions.inventory_exceptions import (
    WarehouseAlreadyExistsError,
    WarehouseNotFoundError,
    InventoryModuleError
)
from ..interfaces.shared_db_interface import IWarehouseRepository

class WarehouseService:
    def __init__(self, warehouse_repo: IWarehouseRepository):
        self.warehouse_repo = warehouse_repo

    def list_warehouses(self) -> List[Dict[str, Any]]:
        return self.warehouse_repo.list()

    def get_warehouse(self, warehouse_id: int) -> Dict[str, Any]:
        wh = self.warehouse_repo.get_by_id(warehouse_id)
        if not wh:
            raise WarehouseNotFoundError(warehouse_id)
        return wh

    def create_warehouse(self, data: Dict[str, Any]) -> Dict[str, Any]:
        name = data.get("name", "").strip()
        code = data.get("code", "").strip().upper()

        if not name:
            raise InventoryModuleError("Warehouse name is required.", field="name")
        if not code:
            raise InventoryModuleError("Warehouse code is required.", field="code")

        existing = self.warehouse_repo.get_by_code(code)
        if existing:
            raise WarehouseAlreadyExistsError(code)

        clean_payload = {
            "name": name,
            "code": code,
            "address": data.get("address", "").strip(),
            "city": data.get("city", "").strip(),
            "state": data.get("state", "").strip(),
            "pincode": data.get("pincode", "").strip(),
            "capacity_sqft": float(data.get("capacity_sqft") or 0.0),
            "is_active": True
        }
        return self.warehouse_repo.create(clean_payload)

    def update_warehouse(self, warehouse_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        self.get_warehouse(warehouse_id)
        return self.warehouse_repo.update(warehouse_id, data)

    def set_warehouse_status(self, warehouse_id: int, is_active: bool) -> bool:
        self.get_warehouse(warehouse_id)
        return self.warehouse_repo.set_status(warehouse_id, is_active)
