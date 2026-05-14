"""
models/resume.py – MongoDB document schema for a student resume.
Stores extracted skills, education, projects and analysis metadata.
"""
from mongoengine import (
    Document, StringField, ListField, DictField,
    ReferenceField, DateTimeField
)
from datetime import datetime
from .user import User

class Resume(Document):
    """Stores parsed resume data uploaded by a student."""

    meta = {"collection": "resumes"}

    # Link to the owning student
    user      = ReferenceField(User, required=True)

    file_name = StringField()                      # Original PDF file name
    upload_date = DateTimeField(default=datetime.utcnow)

    # Full text extracted from the PDF (used for debugging / re-analysis)
    raw_text  = StringField(default="")

    # List of skills found in the resume (e.g. ["Python", "React", "SQL"])
    skills    = ListField(StringField(), default=[])

    # Education entries: [{degree, institution, year, gpa}]
    education = ListField(DictField(), default=[])

    # Projects: [{name, description, tech_stack: []}]
    projects  = ListField(DictField(), default=[])

    # Work experience entries: [{company, role, duration}]
    experience = ListField(DictField(), default=[])

    # Identified resume weaknesses (e.g. "No projects listed", "Low skill count")
    weaknesses = ListField(StringField(), default=[])

    # Processing status
    status    = StringField(default="pending")     # pending | processed | failed

    def to_dict(self):
        return {
            "id":          str(self.id),
            "file_name":   self.file_name,
            "upload_date": self.upload_date.isoformat(),
            "skills":      self.skills,
            "education":   self.education,
            "projects":    self.projects,
            "experience":  self.experience,
            "weaknesses":  self.weaknesses,
            "status":      self.status,
        }
