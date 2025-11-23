# app/repositories/base_repository.py
from sqlalchemy.orm import Session
from typing import TypeVar, Generic, Type, List, Optional
from app.database import Base

T = TypeVar('T', bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model

    def create(self, obj_in: dict) -> T:
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def get_by_id(self, obj_id: int) -> Optional[T]:
        return self.session.query(self.model).filter(self.model.id == obj_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.session.query(self.model).offset(skip).limit(limit).all()

    def update(self, obj_id: int, obj_in: dict) -> Optional[T]:
        db_obj = self.get_by_id(obj_id)
        if db_obj:
            for key, value in obj_in.items():
                if value is not None:
                    setattr(db_obj, key, value)
            self.session.commit()
            self.session.refresh(db_obj)
        return db_obj

    def delete(self, obj_id: int) -> bool:
        db_obj = self.get_by_id(obj_id)
        if db_obj:
            self.session.delete(db_obj)
            self.session.commit()
            return True
        return False