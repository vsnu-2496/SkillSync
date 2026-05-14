"""
services/gap_analyzer.py – Analyzes skill gaps for the student per domain.
"""
from app.models.skill_gap import SkillGap
from .career_matcher import DOMAIN_TEMPLATES

def analyze_gaps(user, resume):
    """
    Creates detailed skill gap documents for each career domain.
    """
    student_skills = [s.lower() for s in resume.skills]
    
    for domain, required_skills in DOMAIN_TEMPLATES.items():
        matched = [s for s in required_skills if s.lower() in student_skills]
        missing = [s for s in required_skills if s.lower() not in student_skills]
        
        match_percent = (len(matched) / len(required_skills)) * 100
        
        # Priority areas are missing skills (in this simple version)
        priority_areas = missing[:3] # Suggest top 3 missing skills to focus on
        
        gap = SkillGap(
            user=user,
            resume=resume,
            domain=domain,
            current_skills=resume.skills,
            required_skills=required_skills,
            missing_skills=missing,
            match_percent=round(match_percent, 2),
            priority_areas=priority_areas
        )
        gap.save()
