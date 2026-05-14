"""
models/recommendation.py – Stores career domain recommendations per resume.
"""
from mongoengine import (
    Document, ListField, DictField, ReferenceField, DateTimeField
)
from datetime import datetime
from .user import User
from .resume import Resume

class Recommendation(Document):
    """Career domain recommendations generated from resume analysis."""

    meta = {"collection": "recommendations"}

    user   = ReferenceField(User,   required=True)
    resume = ReferenceField(Resume, required=True)

    # List of domain recommendation objects, e.g.:
    # {
    #   "domain": "Data Science",
    #   "confidence_score": 72.5,      # 0-100 percentage
    #   "matched_skills": ["Python", "SQL"],
    #   "missing_skills": ["Machine Learning", "TensorFlow"]
    # }
    domains = ListField(DictField(), default=[])

    generated_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":           str(self.id),
            "domains":      self.domains,
            "generated_at": self.generated_at.isoformat(),
        }
