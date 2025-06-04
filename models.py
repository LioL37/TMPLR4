from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, Date, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP)

    buildings = relationship("Building", back_populates="owner")

class Building(Base):
    __tablename__ = "buildings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=False), nullable=False, server_default=func.now())

    owner = relationship("User", back_populates="buildings")
    sensors = relationship("Sensor", back_populates="building")

class Sensor(Base):
    __tablename__ = "sensors"
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"))
    type = Column(String)
    location = Column(String)
    installed_at = Column(Date)
    is_active = Column(Boolean, default=True)

    building = relationship("Building", back_populates="sensors")
    incidents = relationship("Incident", back_populates="sensor")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=True)
    detected_at = Column(TIMESTAMP)
    level = Column(String)
    description = Column(Text)
    resolved = Column(Boolean, default=False)

    sensor = relationship("Sensor", back_populates="incidents")