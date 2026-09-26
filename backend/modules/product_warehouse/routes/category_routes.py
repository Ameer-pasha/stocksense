"""
FastAPI Routes for Category Management (Member 2).
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from ..schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from ..services.category_service import CategoryService
from ..exceptions.inventory_exceptions import InventoryModuleError

def create_category_router(service: CategoryService) -> APIRouter:
    router = APIRouter(prefix="/categories", tags=["Categories"])

    @router.get("", response_model=List[CategoryResponse])
    def get_categories(tree: bool = Query(False)):
        return service.list_categories(tree=tree)

    @router.get("/{category_id}", response_model=CategoryResponse)
    def get_category(category_id: int):
        try:
            return service.get_category(category_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
    def create_category(payload: CategoryCreate):
        try:
            return service.create_category(payload.dict())
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.put("/{category_id}", response_model=CategoryResponse)
    def update_category(category_id: int, payload: CategoryUpdate):
        try:
            return service.update_category(category_id, payload.dict(exclude_unset=True))
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.patch("/{category_id}/status")
    def set_status(category_id: int, is_active: bool = Query(...)):
        try:
            success = service.set_category_status(category_id, is_active)
            return {"id": category_id, "is_active": is_active, "success": success}
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    return router
