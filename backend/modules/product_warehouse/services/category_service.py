"""
Category Service Layer for Member 2.
"""

from typing import List, Dict, Any, Optional
from ..exceptions.inventory_exceptions import CategoryNotFoundError, InventoryModuleError
from ..interfaces.shared_db_interface import ICategoryRepository

class CategoryService:
    def __init__(self, category_repo: ICategoryRepository):
        self.category_repo = category_repo

    def list_categories(self, tree: bool = False) -> List[Dict[str, Any]]:
        categories = self.category_repo.list()
        if not tree:
            return categories

        # Build hierarchy tree
        lookup = {c["id"]: {**c, "children": []} for c in categories}
        tree_roots = []
        for c in lookup.values():
            parent_id = c.get("parent_id")
            if parent_id and parent_id in lookup:
                lookup[parent_id]["children"].append(c)
            else:
                tree_roots.append(c)
        return tree_roots

    def get_category(self, category_id: int) -> Dict[str, Any]:
        cat = self.category_repo.get_by_id(category_id)
        if not cat:
            raise CategoryNotFoundError(category_id)
        return cat

    def create_category(self, data: Dict[str, Any]) -> Dict[str, Any]:
        name = data.get("name", "").strip()
        if not name:
            raise InventoryModuleError("Category name is required.")

        parent_id = data.get("parent_id")
        if parent_id:
            parent = self.category_repo.get_by_id(parent_id)
            if not parent:
                raise CategoryNotFoundError(parent_id)

        clean_payload = {
            "name": name,
            "code": data.get("code", "").strip().upper() or name[:3].upper(),
            "description": data.get("description", "").strip(),
            "parent_id": parent_id,
            "is_active": True
        }
        return self.category_repo.create(clean_payload)

    def update_category(self, category_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        self.get_category(category_id)
        if "parent_id" in data and data["parent_id"] == category_id:
            raise InventoryModuleError("A category cannot be its own parent.")
        return self.category_repo.update(category_id, data)

    def set_category_status(self, category_id: int, is_active: bool) -> bool:
        self.get_category(category_id)
        return self.category_repo.set_status(category_id, is_active)
