from typing import Optional, List
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120, description="Product display name")
    sku: str = Field(..., min_length=2, max_length=50, description="Unique stock keeping unit")
    category_id: int = Field(..., description="Foreign key to category")
    unit_of_measure: str = Field(..., description="Unit (kg, pcs, box, mtr, ltr)")
    description: Optional[str] = Field(None, max_length=500)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    description: Optional[str] = None

class ProductStatusUpdate(BaseModel):
    is_active: bool

class ProductResponse(ProductBase):
    id: int
    is_active: bool
    category_name: Optional[str] = None
    total_available_stock: Optional[float] = 0.0

class LocationStockItem(BaseModel):
    warehouse_id: int
    warehouse_name: str
    location_id: int
    location_code: str
    location_name: str
    available_quantity: float

class ProductAvailabilityResponse(BaseModel):
    product_id: int
    sku: str
    unit: str
    total_stock: float
    locations: List[LocationStockItem]
