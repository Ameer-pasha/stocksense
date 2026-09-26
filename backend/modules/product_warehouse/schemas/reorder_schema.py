from typing import Optional
from pydantic import BaseModel, Field

class ReorderRuleBase(BaseModel):
    product_id: int
    location_id: Optional[int] = None
    min_quantity: float = Field(..., gt=0)
    max_quantity: float = Field(..., gt=0)
    reorder_quantity: float = Field(..., gt=0)

class ReorderRuleCreate(ReorderRuleBase):
    pass

class ReorderRuleUpdate(BaseModel):
    min_quantity: Optional[float] = Field(None, gt=0)
    max_quantity: Optional[float] = Field(None, gt=0)
    reorder_quantity: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class ReorderRuleResponse(ReorderRuleBase):
    id: int
    is_active: bool
    product_name: Optional[str] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    location_name: Optional[str] = None
    current_stock: Optional[float] = 0.0
    status: Optional[str] = "adequate"  # breached, adequate, surplus
