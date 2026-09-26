from typing import Optional
from pydantic import BaseModel, Field

class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=30)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    capacity_sqft: Optional[float] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    capacity_sqft: Optional[float] = None

class WarehouseResponse(WarehouseBase):
    id: int
    is_active: bool
    location_count: Optional[int] = 0
