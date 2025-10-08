from .user import router as user_router
from .location import router as location_router
from .leave import router as leave_router
from .shift import router as shift_router
from .schedule import router as schedule_router
from .auth import router as auth_router
from .subscription import router as subscription_router
from .staff import router as staff_router
from .fte import router as fte_router

__all__ = [
    "user_router",
    "location_router",
    "leave_router",
    "shift_router",
    "schedule_router",
    "auth_router",
    "subscription_router",
    "staff_router",
    "fte_router"
] 