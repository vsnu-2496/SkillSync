"""
models/course.py – Seed data model for course and project recommendations.
"""
from mongoengine import Document, StringField

class Course(Document):
    """A recommended course, certification, or mini-project."""

    meta = {"collection": "courses"}

    title         = StringField(required=True)

    # The career domain this course is associated with
    domain        = StringField(required=True)   # e.g. "Data Science"

    # The specific missing skill this course addresses
    skill_covered = StringField(required=True)   # e.g. "Machine Learning"

    # Online platform where the course is hosted
    platform      = StringField(default="")      # e.g. "Coursera", "Udemy"

    # Direct URL to the course
    url           = StringField(default="")

    # Type of resource
    type          = StringField(default="course")  # course | project | certification

    # Difficulty level
    level         = StringField(default="beginner") # beginner | intermediate | advanced

    # Short description of what the student will learn
    description   = StringField(default="")

    def to_dict(self):
        return {
            "id":            str(self.id),
            "title":         self.title,
            "domain":        self.domain,
            "skill_covered": self.skill_covered,
            "platform":      self.platform,
            "url":           self.url,
            "type":          self.type,
            "level":         self.level,
            "description":   self.description,
        }
