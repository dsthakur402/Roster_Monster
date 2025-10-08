from sqlalchemy.orm import Session
from .. import models, utils

def user_password_verify(username: str, password: str, db: Session):
    """
    Verify user credentials and return user if valid.
    
    Args:
        username: User's email/username
        password: User's password
        db: Database session
        
    Returns:
        User object if credentials are valid, None otherwise
    """
    user = db.query(models.User).filter(models.User.email == username).first()
    if not user:
        return None
    if not utils.verify_password(password, user.password):
        return None
    return user 