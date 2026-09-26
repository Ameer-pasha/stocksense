"""
FastAPI Routes for Reorder Rules Management (Member 2).
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from ..schemas.reorder_schema import ReorderRuleCreate, ReorderRuleResponse
from ..services.reorder_service import ReorderService
from ..exceptions.inventory_exceptions import InventoryModuleError

def create_reorder_router(service: ReorderService) -> APIRouter:
    router = APIRouter(prefix="/reorder-rules", tags=["Reorder Rules"])

    @router.get("", response_model=List[ReorderRuleResponse])
    def get_rules(
        product_id: Optional[int] = None,
        location_id: Optional[int] = None,
        status: Optional[str] = None
    ):
        filters = {
            "product_id": product_id,
            "location_id": location_id,
            "status": status
        }
        return service.list_rules(filters)

    @router.post("", response_model=ReorderRuleResponse, status_code=status.HTTP_201_CREATED)
    def create_rule(payload: ReorderRuleCreate):
        try:
            return service.create_rule(payload.dict())
        except InventoryModuleError as e:
            raise HTTPException(status_code=e.status_code, detail={"code": e.code, "message": e.message})

    @router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_rule(rule_id: int):
        success = service.delete_rule(rule_id)
        if not success:
            raise HTTPException(status_code=404, detail="Rule not found.")
        return None

    return router
