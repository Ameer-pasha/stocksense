"""
FastAPI Routes for Location Management (Member 2).
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from ..schemas.location_schema import LocationCreate, LocationUpdate, LocationResponse
from ..services.location_service import LocationService
from ..exceptions.inventory_exceptions import InventoryModuleError

def create_location_router(service: LocationService) -> APIRouter:
    router = APIRouter(tags=["Locations"])

    @router.get("/warehouses/{warehouse_id}/locations", response_model=List[LocationResponse])
    def get_locations_by_warehouse(warehouse_id: int):
        try:
            return service.get_locations_tree(warehouse_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.get("/locations/{location_id}", response_model=LocationResponse)
    def get_location(location_id: int):
        try:
            return service.get_location(location_id)
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
    def create_location(payload: LocationCreate):
        try:
            return service.create_location(payload.dict())
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.put("/locations/{location_id}", response_model=LocationResponse)
    def update_location(location_id: int, payload: LocationUpdate):
        try:
            return service.update_location(location_id, payload.dict(exclude_unset=True))
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.patch("/locations/{location_id}/status")
    def set_status(location_id: int, is_active: bool = Query(...)):
        try:
            success = service.set_location_status(location_id, is_active)
            return {"id": location_id, "is_active": is_active, "success": success}
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    return router
