from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.database import get_db
from app.models import User
from app.schemas import UserCreate
from app.auth import hash_password, verify_password, create_access_token
import logging

router = APIRouter(prefix="/auth", tags=["auth"])

log = logging.getLogger(__name__)


@router.post(
    "/signup",
    summary="Register a new user",
    description="""
        Creates a new user account.

        Validations:
        - Minimum password length: 6 characters
        - Unique email enforcement
        - Password hashing before storage
    """,
    response_description="User creation confirmation"
    )
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check minimum password length
        if len(payload.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )

        # Check if email already exists
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )

        # Create new user
        user = User(
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            password=hash_password(payload.password)
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        log.info(f"User created successfully: {user.email}")
        return {"success": True, "message": "User created successfully", "user_id": user.id}

    except HTTPException as e:
        log.warning(f"Signup failed: {e.detail}")
        raise e

    except IntegrityError as e:
        db.rollback()
        log.error(f"Database integrity error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database integrity error. Please try again."
        )

    except SQLAlchemyError as e:
        db.rollback()
        log.error(f"Database error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error. Please try again later."
        )

    except Exception as e:
        db.rollback()
        log.exception(f"Unexpected error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )


@router.post(
    "/login",
    summary="Authenticate user and generate JWT token",
    description="""
        Authenticates a user using email and password.

        - Verifies hashed password
        - Generates JWT access token
        - Returns bearer token for protected endpoints
    """,
    response_description="JWT access token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        email = form_data.username
        password = form_data.password

        user = db.query(User).filter(User.email == email).first()

        if not user:
            log.warning(f"Login failed - user not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(password, user.password):
            log.warning(f"Login failed - invalid password: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token({"user_id": user.id})
        log.info(f"Login successful: {email}")
        return {"success": True, "access_token": token, "token_type": "bearer"}

    except HTTPException as e:
        log.warning(f"Login failed: {e.detail}")
        raise e

    except SQLAlchemyError as e:
        log.error(f"Database error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal database error. Please try again later."
        )

    except Exception as e:
        log.exception(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )