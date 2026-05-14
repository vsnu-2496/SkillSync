"""
models/skill_gap.py – Stores skill gap analysis for a student per domain.
"""
from mongoengine import (
    Document, StringField, ListField, FloatField,
    ReferenceField, DateTimeField
)
from datetime import datetime
from .user import User
from .resume import Resume

class SkillGap(Document):
    """Skill gap between what a student has and what a domain requires."""

    meta = {"collection": "skill_gaps"}

    user   = ReferenceField(User,   required=True)
    resume = ReferenceField(Resume, required=True)

    # The career domain being compared (e.g. "Data Science")
    domain = StringField(required=True)

    # Skills extracted from the student's resume
    current_skills  = ListField(StringField(), default=[])

    # All skills required for this domain
    required_skills = ListField(StringField(), default=[])

    # Skills the student is missing
    missing_skills  = ListField(StringField(), default=[])

    # Percentage of required skills the student already has (0-100)
    match_percent   = FloatField(default=0.0)

    # Top skills to focus on first (sorted by importance/frequency)
    priority_areas  = ListField(StringField(), default=[])

    created_at = DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":               str(self.id),
            "domain":           self.domain,
            "current_skills":   self.current_skills,
            "required_skills":  self.required_skills,
            "missing_skills":   self.missing_skills,
            "match_percent":    self.match_percent,
            "priority_areas":   self.priority_areas,
        }
