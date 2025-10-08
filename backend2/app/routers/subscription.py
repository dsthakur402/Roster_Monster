from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import razorpay
from datetime import datetime
from ..database import get_db
from sqlalchemy.orm import Session
from ..models import Subscription, User
from .auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])
print(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
# Initialize Razorpay client
client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class CreateOrderRequest(BaseModel):
    planId: str
    period: str
    amount: int
    currency: str

class VerifyPaymentRequest(BaseModel):
    orderId: str
    paymentId: str
    signature: str

@router.post("/create-order")
async def create_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Create Razorpay order
        order_data = {
            "amount": request.amount,
            "currency": request.currency,
            "receipt": f"order_{current_user.id}_{datetime.now().timestamp()}",
            "notes": {
                "plan_id": request.planId,
                "period": request.period,
                "user_id": current_user.id
            }
        }
        
        order = client.order.create(data=order_data)
        
        # Create subscription record in database
        subscription = Subscription(
            user_id=current_user.id,
            plan_id=request.planId,
            period=request.period,
            amount=request.amount,
            currency=request.currency,
            order_id=order["id"],
            status="pending"
        )
        
        db.add(subscription)
        db.commit()
        
        return {"orderId": order["id"], "keyId": settings.RAZORPAY_KEY_ID}
        
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/verify-payment")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Verify payment signature
        params_dict = {
            "razorpay_order_id": request.orderId,
            "razorpay_payment_id": request.paymentId,
            "razorpay_signature": request.signature
        }
        
        client.utility.verify_payment_signature(params_dict)
        
        # Update subscription status
        subscription = db.query(Subscription).filter(
            Subscription.order_id == request.orderId,
            Subscription.user_id == current_user.id
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found"
            )
        
        subscription.status = "active"
        subscription.payment_id = request.paymentId
        subscription.activated_at = datetime.now()
        
        # Calculate expiration date based on period
        if subscription.period == "monthly":
            subscription.expires_at = datetime.now().replace(
                month=datetime.now().month + 1
            )
        else:  # annual
            subscription.expires_at = datetime.now().replace(
                year=datetime.now().year + 1
            )
        
        db.commit()
        
        return {"status": "success", "message": "Payment verified successfully"}
        
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    return {
        "plan_id": subscription.plan_id,
        "period": subscription.period,
        "status": subscription.status,
        "activated_at": subscription.activated_at,
        "expires_at": subscription.expires_at
    } 