from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import hash_password, verify_password

DEFAULT_USERS = [
    {"email": "admin@hotel.com", "full_name": "Admin User", "password": "admin123", "role": "admin"},
    {"email": "staff@hotel.com", "full_name": "Staff User", "password": "staff123", "role": "staff"},
]


def seed_default_users(db: Session) -> None:
    for data in DEFAULT_USERS:
        user = db.query(User).filter(User.email == data["email"]).first()
        if not user:
            db.add(User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
            ))
            continue

        if not verify_password(data["password"], user.hashed_password):
            user.hashed_password = hash_password(data["password"])
            user.full_name = data["full_name"]
            user.role = data["role"]

    db.commit()
