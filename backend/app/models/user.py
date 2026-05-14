"""
models/user.py – MongoDB document schema for a registered student.
"""
from mongoengine import Document, StringField, ListField, DateTimeField, IntField
from datetime import datetime

class User(Document):
    """Represents a registered student in the system."""

    meta = {
        "collection": "users",
        "strict": False  # Allow fields not defined in the model
    }

    # Basic identity fields
    name  = StringField(required=True, max_length=100)
    email = StringField(required=True, unique=True, max_length=120)

    # Hashed password
    password_hash = StringField()
    password = StringField() # Node backend uses 'password'

    # Career interests
    interests = ListField(StringField(), default=[])
    interestMatrix = ListField(StringField(), default=[])

    # Profile info
    college  = StringField(default="")
    degree   = StringField(default="")
    year     = StringField(default="")
    role     = StringField(default="student")

    # Analysis results
    topRole = StringField(default="")
    matchPercentage = IntField(default=0)
    performanceScore = IntField(default=0)
    skills = ListField(StringField(), default=[])
    skillGaps = ListField(StringField(), default=[])
    solvedQuestionsCount = IntField(default=0)
    recentActivity = ListField(StringField(), default=[])

    created_at = DateTimeField(default=datetime.utcnow)
    createdAt = DateTimeField() # Node backend uses 'createdAt'


    def to_dict(self):
        """Serialise to a plain dict (safe to return in JSON responses)."""
        return {
            "id":                   str(self.id),
            "name":                 self.name,
            "email":                self.email,
            "interests":            self.interests,
            "college":              self.college,
            "degree":               self.degree,
            "year":                 self.year,
            "topRole":              self.topRole,
            "matchPercentage":      self.matchPercentage,
            "performanceScore":     self.performanceScore,
            "skills":               self.skills,
            "skillGaps":            self.skillGaps,
            "solvedQuestionsCount": self.solvedQuestionsCount,
            "recentActivity":       self.recentActivity,
            "hasResume":            len(self.skills) > 0
        }
