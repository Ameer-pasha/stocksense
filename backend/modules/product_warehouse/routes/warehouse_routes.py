"""
FastAPI Routes for Warehouse Management (Member 2).
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from ..schemas.warehouse_schema import WarehouseCreate, WarehouseUpdate, WarehouseResponse
from ..services.warehouse_service import WarehouseService
from ..exceptions.inventory_exceptions import InventoryModuleError

def create_warehouse_router(service: WarehouseService) -> APIRouter:
    router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

    @router.get("", response_model=List[WarehouseResponse])
    def get_warehouses():
        return service.list_warehouses()

    @router.get("/{warehouse_id}", response_model=WarehouseResponse)
    def get_warehouse(warehouse_id: int):
        try:
            return service.get_warehouse(warehouse_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.post("", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
    def create_warehouse(payload: WarehouseCreate):
        try:
            return service.create_warehouse(payload.dict())
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.put("/{warehouse_id}", response_model=WarehouseResponse)
    def update_warehouse(warehouse_id: int, payload: WarehouseUpdate):
        try:
            return service.update_warehouse(warehouse_id, payload.dict(exclude_unset=True))
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.patch("/{warehouse_id}/status")
    def set_status(warehouse_id: int, is_active: bool = Query(...)):
        try:
            success = service.set_warehouse_status(warehouse_id, is_active)
            return {"id": warehouse_id, "is_active": is_active, "success": success}
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    return router
