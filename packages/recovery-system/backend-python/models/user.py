from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserProfile(BaseModel):
    name: Optional[str]
    email: Optional[str]
    age: Optional[int]
    addictionType: Optional[str]
    sobrietyStartDate: Optional[datetime]

class UserProgress(BaseModel):
    currentStreak: int = 0
    longestStreak: int = 0
    totalDaysSober: int = 0
    milestonesAchieved: List[str] = []

class UserContext(BaseModel):
    userId: str
    profile: UserProfile
    recentJournals: List[Dict[str, Any]] = []
    progress: UserProgress
