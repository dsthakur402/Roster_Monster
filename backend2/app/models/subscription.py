from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(String(255), nullable=False)
    period = Column(String(255), nullable=False)  # 'monthly' or 'annual'
    amount = Column(Float, nullable=False)
    currency = Column(String(255), nullable=False)
    order_id = Column(String(255), nullable=True)
    payment_id = Column(String(255), nullable=True)
    status = Column(String(255), nullable=False)  # 'pending', 'active', 'cancelled', 'expired'
    activated_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions") 