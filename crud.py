from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
import schemas
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# USERS
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> models.User:
    """Получает пользователя по ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> models.User:
    """Получает пользователя по email"""
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_user.username = user.username
    db_user.email = user.email
    db_user.password_hash = pwd_context.hash(user.password)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

def check_owner_or_admin(db: Session, user_id: int, resource_owner_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != resource_owner_id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    
# BUILDINGS
def create_building(db: Session, building: schemas.BuildingCreate, owner_id: int):
    db_building = models.Building(
        name=building.name,
        address=building.address,
        owner_id=owner_id,
        created_at=datetime.utcnow()  # Явно устанавливаем время
    )
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building

def get_building(db: Session, building_id: int):
    return db.query(models.Building).filter(models.Building.id == building_id).first()

def get_buildings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Building).offset(skip).limit(limit).all()

def update_building(db: Session, building_id: int, building: schemas.BuildingCreate):
    db_building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not db_building:
        return None
    db_building.name = building.name
    db_building.address = building.address
    #db_building.owner_id = building.owner_id
    db.commit()
    db.refresh(db_building)
    return db_building

def delete_building(db: Session, building_id: int):
    db_building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not db_building:
        return False
    db.delete(db_building)
    db.commit()
    return True

# SENSORS
def create_sensor(db: Session, sensor: schemas.SensorCreate):
    db_sensor = models.Sensor(
        type=sensor.type,
        location=sensor.location,
        installed_at=sensor.installed_at,
        building_id=sensor.building_id,
        is_active=sensor.is_active
    )
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def get_sensor(db: Session, sensor_id: int):
    return db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()

def get_sensors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sensor).offset(skip).limit(limit).all()

def update_sensor(db: Session, sensor_id: int, sensor: schemas.SensorCreate):
    db_sensor = db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()
    if not db_sensor:
        return None
    db_sensor.type = sensor.type
    db_sensor.location = sensor.location
    db_sensor.installed_at = sensor.installed_at
    db_sensor.building_id = sensor.building_id
    db_sensor.is_active = sensor.is_active
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def delete_sensor(db: Session, sensor_id: int):
    db_sensor = db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()
    if not db_sensor:
        return False
    db.delete(db_sensor)
    db.commit()
    return True

# INCIDENTS
def create_incident(db: Session, incident: schemas.IncidentCreate):
    db_incident = models.Incident(
        level=incident.level,
        description=incident.description,
        sensor_id=incident.sensor_id,
        detected_at=incident.detected_at or datetime.utcnow(),  # Установка времени
        resolved=False
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def get_incident(db: Session, incident_id: int):
    return db.query(models.Incident).filter(models.Incident.id == incident_id).first()

def get_incidents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Incident).offset(skip).limit(limit).all()

def update_incident(db: Session, incident_id: int, incident: schemas.IncidentCreate):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        return None
    db_incident.level = incident.level
    db_incident.description = incident.description
    db_incident.sensor_id = incident.sensor_id
    db_incident.resolved = getattr(incident, "resolved", db_incident.resolved)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def delete_incident(db: Session, incident_id: int):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        return False
    db.delete(db_incident)
    db.commit()
    return True