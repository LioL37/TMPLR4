from fastapi import FastAPI, HTTPException, Depends, status, Request, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
import models
import schemas
import crud
import database
import auth
from auth import oauth2_scheme
from auth import pwd_context
from logger import logger
from database import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional

app = FastAPI()
security = HTTPBearer()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)

# USERS
@app.post("/users/", response_model=schemas.User, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/register", response_model=schemas.Token)
async def register_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    # Проверка существующего пользователя
    db_user = crud.get_user_by_email(db, email=user_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Создание пользователя
    user = crud.create_user(db=db, user=user_data)
    
    # Создание токенов
    access_token = auth.create_access_token(user.id)
    refresh_token = auth.create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,  # Добавляем refresh_token
        "token_type": "bearer"
    }

# BUILDINGS
@app.post("/buildings/", response_model=schemas.Building, status_code=201)
def create_building(
    building: schemas.BuildingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        return crud.create_building(db=db, building=building, owner_id=current_user.id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Validation error: {str(e)}"
        )

@app.get("/buildings/{building_id}", response_model=schemas.Building)
def read_building(building_id: int, db: Session = Depends(get_db)):
    db_building = crud.get_building(db, building_id=building_id)
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    return db_building

@app.get("/buildings/", response_model=list[schemas.Building])
def read_buildings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_buildings(db, skip=skip, limit=limit)

@app.put("/buildings/{building_id}", response_model=schemas.Building)
def update_building(
    building_id: int,
    building: schemas.BuildingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_building = crud.get_building(db, building_id=building_id)
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    auth.check_owner_or_admin(db, current_user.id, db_building.owner_id)
    
    return crud.update_building(db, building_id=building_id, building=building)

@app.delete("/buildings/{building_id}", status_code=204)
def delete_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_building = crud.get_building(db, building_id=building_id)
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    auth.check_owner_or_admin(db, current_user.id, db_building.owner_id)
    
    if not crud.delete_building(db, building_id=building_id):
        raise HTTPException(status_code=404, detail="Building not found")

# SENSORS
@app.post("/sensors/", response_model=schemas.Sensor, status_code=201)
def create_sensor(sensor: schemas.SensorCreate, db: Session = Depends(get_db)):
    return crud.create_sensor(db=db, sensor=sensor)

@app.get("/sensors/{sensor_id}", response_model=schemas.Sensor)
def read_sensor(sensor_id: int, db: Session = Depends(get_db)):
    db_sensor = crud.get_sensor(db, sensor_id=sensor_id)
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return db_sensor

@app.get("/sensors/", response_model=list[schemas.Sensor])
def read_sensors(
    building_id: int = None,  # Новый параметр фильтрации
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Sensor)
    if building_id is not None:
        query = query.filter(models.Sensor.building_id == building_id)
    return query.offset(skip).limit(limit).all()

@app.put("/sensors/{sensor_id}", response_model=schemas.Sensor)
def update_sensor(
    sensor_id: int,
    sensor: schemas.SensorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_sensor = crud.get_sensor(db, sensor_id=sensor_id)
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    # Получаем здание, которому принадлежит датчик
    db_building = crud.get_building(db, building_id=db_sensor.building_id)
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    auth.check_owner_or_admin(db, current_user.id, db_building.owner_id)
    
    return crud.update_sensor(db, sensor_id=sensor_id, sensor=sensor)

@app.delete("/sensors/{sensor_id}", status_code=204)
def delete_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_sensor = crud.get_sensor(db, sensor_id=sensor_id)
    if not db_sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    db_building = crud.get_building(db, building_id=db_sensor.building_id)
    if not db_building:
        raise HTTPException(status_code=404, detail="Building not found")
    
    auth.check_owner_or_admin(db, current_user.id, db_building.owner_id)
    
    if not crud.delete_sensor(db, sensor_id=sensor_id):
        raise HTTPException(status_code=404, detail="Sensor not found")

# INCIDENTS
@app.patch("/incidents/{incident_id}", response_model=schemas.Incident)
def update_incident(
    incident_id: int,
    incident_update: schemas.IncidentUpdate,  # Новая схема для обновления
    db: Session = Depends(get_db)
):
    db_incident = crud.get_incident(db, incident_id=incident_id)
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Обновляем только разрешенные поля
    update_data = incident_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident

# Эндпоинт для создания инцидента
@app.post("/incidents", response_model=schemas.Incident, status_code=201)
async def create_incident(
    incident: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Проверяем существование датчика
        sensor = crud.get_sensor(db, incident.sensor_id)
        if not sensor:
            raise HTTPException(status_code=404, detail="Датчик не найден")
        
        # Создаем инцидент
        db_incident = crud.create_incident(db=db, incident=incident)
        return db_incident
    except Exception as e:
        logger.error(f"Ошибка создания инцидента: {str(e)}")
        raise HTTPException(status_code=500, detail="Ошибка сервера")

@app.get("/incidents", response_model=List[schemas.Incident])
def read_incidents(
    skip: int = 0,
    limit: int = 100,
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Incident)
    
    if resolved is not None:
        query = query.filter(models.Incident.resolved == resolved)
    
    return query.offset(skip).limit(limit).all()

# TOKEN
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(auth_data: schemas.UserAuth, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=auth_data.email)
    if not user or not pwd_context.verify(auth_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    access_token = auth.create_access_token(user.id)  # Передаем только ID
    refresh_token = auth.create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }

@app.post("/refresh-token", response_model=schemas.Token)
def refresh_access_token(
    refresh_token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    try:
        email = auth.verify_token(refresh_token, "refresh")
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        access_token = auth.create_access_token(data={"sub": user.email})
        new_refresh_token = auth.create_refresh_token(data={"sub": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": new_refresh_token
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
@app.post("/validate-token")
def validate_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
    )
    
    try:
        email = auth.verify_token(token, credentials_exception)
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
        
        return {"valid": True, "user": {"email": email, "id": user.id}}
    except JWTError:
        return {"valid": False}

# middleware  
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}", exc_info=True)
        raise

# Глобальный обработчик ошибок
@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(
        f"HTTPException: {exc.status_code} - {exc.detail}",
        extra={"status_code": exc.status_code, "detail": exc.detail}
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(Exception)
def universal_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "Internal server error"},
    )
