from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime, date
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    
    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "johndoe@example.com",
                "password": "securepassword123"
            }
        }

class User(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_admin: bool
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class BuildingBase(BaseModel):
    name: str
    address: str

class BuildingCreate(BuildingBase):
    pass

class Building(BuildingBase):
    id: int
    owner_id: int
    created_at: Optional[datetime] = None
    
    @field_validator('created_at', mode='before')
    def parse_created_at(cls, value):
        if value is None:
            return None
        # Если значение уже datetime, возвращаем как есть
        if isinstance(value, datetime):
            return value
        # Парсим строку или другие форматы
        try:
            return datetime.fromisoformat(value) if value else None
        except (TypeError, ValueError):
            return None
    
    class Config:
        from_attributes = True
        orm_mode = True

class SensorBase(BaseModel):
    type: str
    location: str
    installed_at: Optional[datetime] = None

class SensorCreate(SensorBase):
    building_id: int
    is_active: bool

class Sensor(SensorBase):
    id: int
    building_id: int
    is_active: bool

    class Config:
        orm_mode = True

class IncidentBase(BaseModel):
    level: str
    description: Optional[str] = None

class IncidentCreate(BaseModel):
    level: str = "medium"
    description: Optional[str] = None
    sensor_id: int
    detected_at: Optional[datetime] = None

class Incident(IncidentBase):
    id: int
    sensor_id: Optional[int] = None
    detected_at: datetime
    resolved: bool
    
    class Config:
        orm_mode = True

class UserAuth(BaseModel):
    email: EmailStr
    password: str

    class Config:
        from_attributes = True
    
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class IncidentUpdate(BaseModel):
    resolved: Optional[bool] = None
    description: Optional[str] = None