"""
StockSense Backend Entrypoint — Member 2 Application Layer.
Mounts Product & Warehouse routers, configures CORS for cross-member integration,
and provides dependency injection for the Shared Database repository.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

# Import Member 2 Services & Routers
from .modules.product_warehouse.services.product_service import ProductService
from .modules.product_warehouse.services.category_service import CategoryService
from .modules.product_warehouse.services.warehouse_service import WarehouseService
from .modules.product_warehouse.services.location_service import LocationService
from .modules.product_warehouse.services.reorder_service import ReorderService

from .modules.product_warehouse.routes.product_routes import create_product_router
from .modules.product_warehouse.routes.category_routes import create_category_router
from .modules.product_warehouse.routes.warehouse_routes import create_warehouse_router
from .modules.product_warehouse.routes.location_routes import create_location_router
from .modules.product_warehouse.routes.reorder_routes import create_reorder_router

from .modules.product_warehouse.interfaces.shared_db_interface import (
    IProductRepository,
    ICategoryRepository,
    IWarehouseRepository,
    ILocationRepository,
    IReorderRuleRepository,
    IStockAvailabilityReader
)

# ----------------------------------------------------------------------------------
# DEFAULT REPOSITORY IMPLEMENTATION (Consumed until Database Owner plugs in SQL ORM)
# ----------------------------------------------------------------------------------
class InMemorySharedDatabase(
    IProductRepository, 
    ICategoryRepository, 
    IWarehouseRepository, 
    ILocationRepository, 
    IReorderRuleRepository,
    IStockAvailabilityReader
):
    """
    Default in-memory repository implementing shared DB contracts.
    When the database teammate provides their PostgreSQL/SQLAlchemy repository,
    simply swap this instance in main.py without changing any services or endpoints!
    """
    def __init__(self):
        self.categories = [
            {"id": 1, "name": "Raw Materials", "code": "RAW", "description": "Core metals and components", "parent_id": None, "is_active": True},
            {"id": 2, "name": "Steel & Alloys", "code": "STL", "description": "Structural steel, rods", "parent_id": 1, "is_active": True},
            {"id": 3, "name": "Finished Goods", "code": "FG", "description": "Packaged items", "parent_id": None, "is_active": True}
        ]
        self.warehouses = [
            {"id": 1, "name": "Bangalore Central DC", "code": "WH-BLR-01", "address": "Electronic City", "city": "Bangalore", "state": "KA", "pincode": "560100", "capacity_sqft": 45000.0, "is_active": True},
            {"id": 2, "name": "Mysore Facility", "code": "WH-MYS-01", "address": "Hebbal Ind Area", "city": "Mysore", "state": "KA", "pincode": "570016", "capacity_sqft": 22000.0, "is_active": True}
        ]
        self.locations = [
            {"id": 101, "warehouse_id": 1, "parent_id": None, "name": "Zone A", "code": "WH1-ZA", "type": "zone", "full_path": "Zone A", "is_active": True},
            {"id": 102, "warehouse_id": 1, "parent_id": 101, "name": "Rack R1", "code": "WH1-ZA-R1", "type": "rack", "full_path": "Zone A > Rack R1", "is_active": True},
            {"id": 103, "warehouse_id": 1, "parent_id": 102, "name": "Shelf S1", "code": "WH1-ZA-R1-S1", "type": "shelf", "full_path": "Zone A > Rack R1 > Shelf S1", "is_active": True}
        ]
        self.products = [
            {"id": 1, "name": "Mild Steel Rod 12mm", "sku": "STL-001", "category_id": 2, "unit_of_measure": "kg", "description": "Structural steel", "is_active": True, "total_available_stock": 240.0}
        ]
        self.stock_records = [
            {"product_id": 1, "warehouse_id": 1, "location_id": 103, "quantity": 240.0}
        ]
        self.reorder_rules = [
            {"id": 1, "product_id": 1, "location_id": 103, "min_quantity": 50.0, "max_quantity": 500.0, "reorder_quantity": 100.0, "is_active": True}
        ]

    # Product
    def list(self, filters: Dict[str, Any], page: int, limit: int) -> Dict[str, Any]:
        items = self.products
        if filters.get("search"):
            q = filters["search"].lower()
            items = [p for p in items if q in p["name"].lower() or q in p["sku"].lower()]
        return {"items": items, "total": len(items), "page": page, "limit": limit}

    def get_by_id(self, product_id: int) -> Optional[Dict[str, Any]]:
        return next((p for p in self.products if p["id"] == product_id), None)

    def get_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        return next((p for p in self.products if p["sku"].upper() == sku.upper()), None)

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        new_p = {**data, "id": len(self.products) + 1, "total_available_stock": 0.0}
        self.products.append(new_p)
        return new_p

    def update(self, product_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        p = self.get_by_id(product_id)
        if p:
            p.update(data)
        return p

    def set_status(self, product_id: int, is_active: bool) -> bool:
        p = self.get_by_id(product_id)
        if p:
            p["is_active"] = is_active
            return True
        return False

    # Availability
    def get_stock_by_product(self, product_id: int) -> List[Dict[str, Any]]:
        wh_map = {w["id"]: w["name"] for w in self.warehouses}
        loc_map = {l["id"]: l for l in self.locations}
        records = [s for s in self.stock_records if s["product_id"] == product_id]
        res = []
        for r in records:
            loc = loc_map.get(r["location_id"], {})
            res.append({
                "warehouse_id": r["warehouse_id"],
                "warehouse_name": wh_map.get(r["warehouse_id"], "Unknown WH"),
                "location_id": r["location_id"],
                "location_code": loc.get("code", "N/A"),
                "location_name": loc.get("full_path", "General"),
                "available_quantity": r["quantity"]
            })
        return res

    # Categories
    def list_categories(self) -> List[Dict[str, Any]]:
        return self.categories

    # Warehouses
    def list_warehouses(self) -> List[Dict[str, Any]]:
        loc_counts = {}
        for l in self.locations:
            loc_counts[l["warehouse_id"]] = loc_counts.get(l["warehouse_id"], 0) + 1
        return [{**w, "location_count": loc_counts.get(w["id"], 0)} for w in self.warehouses]

    def get_warehouse_by_id(self, warehouse_id: int) -> Optional[Dict[str, Any]]:
        return next((w for w in self.warehouses if w["id"] == warehouse_id), None)

    def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        return next((w for w in self.warehouses if w["code"].upper() == code.upper()), None)

    # Locations
    def list_by_warehouse(self, warehouse_id: int) -> List[Dict[str, Any]]:
        return [l for l in self.locations if l["warehouse_id"] == warehouse_id]

    def get_location_by_id(self, location_id: int) -> Optional[Dict[str, Any]]:
        return next((l for l in self.locations if l["id"] == location_id), None)

    def get_location_by_code(self, warehouse_id: int, code: str) -> Optional[Dict[str, Any]]:
        return next((l for l in self.locations if l["warehouse_id"] == warehouse_id and l["code"].upper() == code.upper()), None)

    # Reorder Rules
    def list_reorder_rules(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        return self.reorder_rules

    def delete_reorder_rule(self, rule_id: int) -> bool:
        before = len(self.reorder_rules)
        self.reorder_rules = [r for r in self.reorder_rules if r["id"] != rule_id]
        return len(self.reorder_rules) < before


# ----------------------------------------------------------------------------------
# APP INITIALIZATION & CORS SETUP
# ----------------------------------------------------------------------------------
app = FastAPI(
    title="StockSense API — Product & Warehouse Management (Member 2)",
    description="Clean application and service layer consuming shared DB contract.",
    version="1.0.0"
)

# Open CORS configuration for team integration (Members 1, 3, 4 frontend & backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Database Instance (Swap with real database repository upon team integration)
shared_db = InMemorySharedDatabase()

# Services Initialization
product_service = ProductService(product_repo=shared_db, category_repo=shared_db, stock_reader=shared_db)
category_service = CategoryService(category_repo=shared_db)
warehouse_service = WarehouseService(warehouse_repo=shared_db)
location_service = LocationService(location_repo=shared_db, warehouse_repo=shared_db)
reorder_service = ReorderService(reorder_repo=shared_db, product_repo=shared_db, location_repo=shared_db, stock_reader=shared_db)

# Mount Member 2 Routers under /api
app.include_router(create_product_router(product_service), prefix="/api")
app.include_router(create_category_router(category_service), prefix="/api")
app.include_router(create_warehouse_router(warehouse_service), prefix="/api")
app.include_router(create_location_router(location_service), prefix="/api")
app.include_router(create_reorder_router(reorder_service), prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for team orchestration and heartbeat monitors."""
    return {
        "status": "healthy",
        "module": "Member 2: Product & Warehouse Management",
        "cors_open": True,
        "endpoints": [
            "/api/products",
            "/api/categories",
            "/api/warehouses",
            "/api/locations",
            "/api/reorder-rules"
        ]
    }
