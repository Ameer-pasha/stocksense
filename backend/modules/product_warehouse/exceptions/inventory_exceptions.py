"""
Custom domain exceptions for Member 2 Product & Warehouse Management Module.
"""

class InventoryModuleError(Exception):
    """Base exception for inventory module."""
    def __init__(self, message: str, code: str = "INVENTORY_ERROR", status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code

class ProductAlreadyExistsError(InventoryModuleError):
    def __init__(self, sku: str):
        super().__init__(f"Product with SKU '{sku}' already exists.", code="SKU_ALREADY_EXISTS", status_code=409)

class ProductNotFoundError(InventoryModuleError):
    def __init__(self, product_id: int):
        super().__init__(f"Product with ID '{product_id}' was not found.", code="PRODUCT_NOT_FOUND", status_code=404)

class CategoryNotFoundError(InventoryModuleError):
    def __init__(self, category_id: int):
        super().__init__(f"Category with ID '{category_id}' was not found or is inactive.", code="CATEGORY_NOT_FOUND", status_code=404)

class WarehouseAlreadyExistsError(InventoryModuleError):
    def __init__(self, code: str):
        super().__init__(f"Warehouse with code '{code}' already exists.", code="WAREHOUSE_CODE_EXISTS", status_code=409)

class WarehouseNotFoundError(InventoryModuleError):
    def __init__(self, warehouse_id: int):
        super().__init__(f"Warehouse with ID '{warehouse_id}' was not found.", code="WAREHOUSE_NOT_FOUND", status_code=404)

class InvalidLocationHierarchyError(InventoryModuleError):
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_LOCATION_HIERARCHY", status_code=422)

class LocationNotFoundError(InventoryModuleError):
    def __init__(self, location_id: int):
        super().__init__(f"Location with ID '{location_id}' was not found.", code="LOCATION_NOT_FOUND", status_code=404)

class ReorderRuleValidationError(InventoryModuleError):
    def __init__(self, message: str):
        super().__init__(message, code="INVALID_REORDER_RULE", status_code=422)
