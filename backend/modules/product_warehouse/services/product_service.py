"""
Product Service Layer for Member 2.
Encapsulates business rules, validation, and consumes shared repository.
"""

from typing import Dict, Any, Optional
from ..exceptions.inventory_exceptions import (
    ProductAlreadyExistsError,
    ProductNotFoundError,
    CategoryNotFoundError,
    InventoryModuleError
)
from ..interfaces.shared_db_interface import (
    IProductRepository,
    ICategoryRepository,
    IStockAvailabilityReader
)

SUPPORTED_UNITS = {"kg", "pcs", "box", "mtr", "ltr", "sqm", "set"}

class ProductService:
    def __init__(
        self,
        product_repo: IProductRepository,
        category_repo: ICategoryRepository,
        stock_reader: Optional[IStockAvailabilityReader] = None
    ):
        self.product_repo = product_repo
        self.category_repo = category_repo
        self.stock_reader = stock_reader

    def list_products(self, filters: Dict[str, Any], page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Fetch filtered and paginated product list."""
        return self.product_repo.list(filters, page, limit)

    def get_product(self, product_id: int) -> Dict[str, Any]:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ProductNotFoundError(product_id)
        return product

    def create_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        sku = data.get("sku", "").strip().upper()
        name = data.get("name", "").strip()
        category_id = data.get("category_id")
        unit = data.get("unit_of_measure", "").strip().lower()

        if not name:
            raise InventoryModuleError("Product name cannot be empty.", field="name")
        if not sku:
            raise InventoryModuleError("SKU is required.", field="sku")
        if unit not in SUPPORTED_UNITS:
            raise InventoryModuleError(f"Unit '{unit}' is unsupported. Allowed: {sorted(list(SUPPORTED_UNITS))}")

        # Check Category exists and is active
        category = self.category_repo.get_by_id(category_id)
        if not category or not category.get("is_active", True):
            raise CategoryNotFoundError(category_id)

        # Check SKU uniqueness
        existing = self.product_repo.get_by_sku(sku)
        if existing:
            raise ProductAlreadyExistsError(sku)

        clean_payload = {
            "name": name,
            "sku": sku,
            "category_id": category_id,
            "unit_of_measure": unit,
            "description": data.get("description", "").strip(),
            "is_active": True
        }

        return self.product_repo.create(clean_payload)

    def update_product(self, product_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        product = self.get_product(product_id)

        if "category_id" in data and data["category_id"] is not None:
            category = self.category_repo.get_by_id(data["category_id"])
            if not category or not category.get("is_active", True):
                raise CategoryNotFoundError(data["category_id"])

        if "unit_of_measure" in data and data["unit_of_measure"]:
            unit = data["unit_of_measure"].strip().lower()
            if unit not in SUPPORTED_UNITS:
                raise InventoryModuleError(f"Unit '{unit}' is unsupported.")
            data["unit_of_measure"] = unit

        return self.product_repo.update(product_id, data)

    def set_product_status(self, product_id: int, is_active: bool) -> bool:
        """Soft-deactivate product to maintain stock ledger historical integrity."""
        self.get_product(product_id)
        return self.product_repo.set_status(product_id, is_active)

    def get_product_availability(self, product_id: int) -> Dict[str, Any]:
        """Read-only presentation of stock across warehouses and locations."""
        product = self.get_product(product_id)
        locations = []
        total_stock = 0.0

        if self.stock_reader:
            locations = self.stock_reader.get_stock_by_product(product_id)
            total_stock = sum(loc.get("available_quantity", 0.0) for loc in locations)

        return {
            "product_id": product["id"],
            "sku": product["sku"],
            "name": product["name"],
            "unit": product["unit_of_measure"],
            "total_stock": total_stock,
            "locations": locations
        }
