from typing import Optional, List
from pydantic import BaseModel, Field

class LocationBase(BaseModel):
    warehouse_id: int
    parent_id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=50)
    type: str = Field(..., description="zone, rack, shelf, bin, bay")

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    type: Optional[str] = None

class LocationResponse(LocationBase):
    id: int
    is_active: bool
    full_path: Optional[str] = None
    children: Optional[List['LocationResponse']] = []
