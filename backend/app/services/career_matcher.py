"""
services/career_matcher.py – Recommends career domains based on resume skills.
"""
from app.models.recommendation import Recommendation

DOMAIN_TEMPLATES = {
    "Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "SQL"],
    "Data Science": ["Python", "SQL", "Pandas", "NumPy", "Machine Learning", "Deep Learning", "Data Analysis"],
    "Cloud Computing": ["AWS", "Azure", "Docker", "Kubernetes", "Linux", "Networking"],
    "Mobile Development": ["Java", "Kotlin", "Swift", "React Native", "Flutter"],
    "Software Testing": ["Automation Testing", "Selenium", "JUnit", "Unit Testing", "Jest"],
    "UI/UX Design": ["Figma", "Adobe XD", "Sketch", "HTML", "CSS", "Visual Design"]
}

def generate_recommendations(user, resume):
    """
    Compares resume skills with domain templates to generate career recommendations.
    """
    student_skills = [s.lower() for s in resume.skills]
    domain_recs = []
    
    for domain, required_skills in DOMAIN_TEMPLATES.items():
        required_skills_lower = [s.lower() for s in required_skills]
        
        # Calculate matched skills
        matched = [s for s in required_skills if s.lower() in student_skills]
        missing = [s for s in required_skills if s.lower() not in student_skills]
        
        # Simple Jaccard-like confidence score
        # (Matched / Total Required) * 100
        score = (len(matched) / len(required_skills)) * 100
        
        domain_recs.append({
            "domain": domain,
            "confidence_score": round(score, 2),
            "matched_skills": matched,
            "missing_skills": missing
        })
        
    # Save the recommendation document
    rec = Recommendation(
        user=user,
        resume=resume,
        domains=domain_recs
    )
    rec.save()
    return rec
