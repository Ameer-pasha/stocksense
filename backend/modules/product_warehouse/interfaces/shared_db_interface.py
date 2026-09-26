"""
Shared Database Repository Interfaces for Member 2 (Product & Warehouse).
NOTE: The actual database schema, migrations, connection pools, and ORM models
are OWNED BY THE DATABASE TEAMMATE.
This file defines the abstract repository contracts that Member 2's services consume.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

class IProductRepository(ABC):
    @abstractmethod
    def list(self, filters: Dict[str, Any], page: int, limit: int) -> Dict[str, Any]:
        """List products matching query filters."""
        pass

    @abstractmethod
    def get_by_id(self, product_id: int) -> Optional[Dict[str, Any]]:
        """Fetch single product by primary key."""
        pass

    @abstractmethod
    def get_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        """Fetch single product by SKU."""
        pass

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Persist new product record."""
        pass

    @abstractmethod
    def update(self, product_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update existing product record."""
        pass

    @abstractmethod
    def set_status(self, product_id: int, is_active: bool) -> bool:
        """Toggle active flag."""
        pass


class ICategoryRepository(ABC):
    @abstractmethod
    def list(self) -> List[Dict[str, Any]]:
        """List all product categories."""
        pass

    @abstractmethod
    def get_by_id(self, category_id: int) -> Optional[Dict[str, Any]]:
        """Fetch category by id."""
        pass

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create category."""
        pass

    @abstractmethod
    def update(self, category_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update category."""
        pass

    @abstractmethod
    def set_status(self, category_id: int, is_active: bool) -> bool:
        """Toggle category status."""
        pass


class IWarehouseRepository(ABC):
    @abstractmethod
    def list(self) -> List[Dict[str, Any]]:
        """List all warehouses with location counts."""
        pass

    @abstractmethod
    def get_by_id(self, warehouse_id: int) -> Optional[Dict[str, Any]]:
        """Get warehouse by id."""
        pass

    @abstractmethod
    def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Get warehouse by unique code."""
        pass

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create warehouse."""
        pass

    @abstractmethod
    def update(self, warehouse_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update warehouse."""
        pass

    @abstractmethod
    def set_status(self, warehouse_id: int, is_active: bool) -> bool:
        """Toggle active status."""
        pass


class ILocationRepository(ABC):
    @abstractmethod
    def list_by_warehouse(self, warehouse_id: int) -> List[Dict[str, Any]]:
        """Get location tree for a warehouse."""
        pass

    @abstractmethod
    def get_by_id(self, location_id: int) -> Optional[Dict[str, Any]]:
        """Get single location."""
        pass

    @abstractmethod
    def get_by_code(self, warehouse_id: int, code: str) -> Optional[Dict[str, Any]]:
        """Get location by warehouse + code."""
        pass

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create location."""
        pass

    @abstractmethod
    def update(self, location_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update location."""
        pass

    @abstractmethod
    def set_status(self, location_id: int, is_active: bool) -> bool:
        """Toggle location status."""
        pass


class IReorderRuleRepository(ABC):
    @abstractmethod
    def list(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """List configured reorder rules."""
        pass

    @abstractmethod
    def get_by_id(self, rule_id: int) -> Optional[Dict[str, Any]]:
        """Get reorder rule by id."""
        pass

    @abstractmethod
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create reorder rule."""
        pass

    @abstractmethod
    def update(self, rule_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update reorder rule."""
        pass

    @abstractmethod
    def delete(self, rule_id: int) -> bool:
        """Delete reorder rule."""
        pass


class IStockAvailabilityReader(ABC):
    """
    Read-only view provided by Member 1 (Stock Ledger) or shared inventory views.
    Member 2 does NOT modify stock.
    """
    @abstractmethod
    def get_stock_by_product(self, product_id: int) -> List[Dict[str, Any]]:
        """Returns stock quantities per warehouse & location for the product."""
        pass
