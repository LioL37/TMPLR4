from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from logger import logger
import crud
import database
import models
from typing import Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Конфигурация JWT
SECRET_KEY = "bebebe"  # В продакшене используйте надежный ключ из переменных окружения
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Создает access token с указанным user_id"""
    try:
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode = {
            "user_id": user_id,
            "type": "access",
            "exp": expire
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Access token creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Token creation failed")

def create_refresh_token(user_id: int) -> str:
    """Создает refresh token с указанным user_id"""
    try:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "user_id": user_id,
            "type": "refresh",
            "exp": expire
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Refresh token creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Token creation failed")

def get_user_id_from_token(token: str = Depends(oauth2_scheme)) -> int:
    """Извлекает user_id из валидного токена"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        token_type = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
        return int(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception

def get_current_user(
    db: Session = Depends(database.get_db),
    user_id: int = Depends(get_user_id_from_token)
) -> models.User:
    """Получает полные данные пользователя по ID из токена"""
    try:
        user = crud.get_user(db, user_id=user_id)
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User data fetch failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

def check_owner_or_admin(
    db: Session,
    current_user_id: int,
    resource_owner_id: int
) -> bool:
    """Проверяет, является ли пользователь владельцем или админом"""
    user = crud.get_user(db, user_id=current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id != resource_owner_id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    return True