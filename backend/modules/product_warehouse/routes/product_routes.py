"""
FastAPI Routes for Product Management (Member 2).
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any
from ..schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductStatusUpdate,
    ProductResponse,
    ProductAvailabilityResponse
)
from ..services.product_service import ProductService
from ..exceptions.inventory_exceptions import InventoryModuleError

def create_product_router(service: ProductService) -> APIRouter:
    router = APIRouter(prefix="/products", tags=["Products"])

    @router.get("", response_model=Dict[str, Any])
    def get_products(
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        warehouse_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        page: int = Query(1, ge=1),
        limit: int = Query(20, ge=1, le=100)
    ):
        filters = {
            "search": search,
            "category_id": category_id,
            "warehouse_id": warehouse_id,
            "is_active": is_active
        }
        return service.list_products(filters, page=page, limit=limit)

    @router.get("/{product_id}", response_model=ProductResponse)
    def get_product(product_id: int):
        try:
            return service.get_product(product_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
    def create_product(payload: ProductCreate):
        try:
            return service.create_product(payload.dict())
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.put("/{product_id}", response_model=ProductResponse)
    def update_product(product_id: int, payload: ProductUpdate):
        try:
            return service.update_product(product_id, payload.dict(exclude_unset=True))
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.patch("/{product_id}/status")
    def set_product_status(product_id: int, payload: ProductStatusUpdate):
        try:
            success = service.set_product_status(product_id, payload.is_active)
            return {"id": product_id, "is_active": payload.is_active, "success": success}
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.get("/{product_id}/availability", response_model=ProductAvailabilityResponse)
    def get_availability(product_id: int):
        try:
            return service.get_product_availability(product_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    return router
