"""
services/skill_extractor.py – NLP-based extraction of skills and resume sections.
"""
import re

# A basic list of skills for keyword matching (In production, use a larger database or trained spaCy model)
SKILL_DB = [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "HTML", "CSS", "SQL", "NoSQL",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "FastAPI",
    "Spring Boot", "Hibernate", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Analysis", "Pandas", "NumPy",
    "UI/UX", "Figma", "Adobe XD", "Sketch", "Testing", "Unit Testing", "PyTest", "Jest", "Selenium"
]

def extract_skills_and_sections(text):
    """
    Extracts skills, education, and projects from resume text.
    Simple regex and keyword matching approach.
    """
    # 1. Extract Skills
    found_skills = []
    # Use word boundary to avoid partial matches
    for skill in SKILL_DB:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.append(skill)
            
    # 2. Extract Education (Simple heuristic looking for Degree keywords)
    education = []
    degrees = ["Bachelor", "B.E", "B.Tech", "Master", "M.E", "M.Tech", "BSc", "MSc", "PhD"]
    lines = text.split("\n")
    for line in lines:
        if any(degree in line for degree in degrees):
            education.append({"raw_line": line.strip()})

    # 3. Extract Projects (Looking for "Project" header or bullets)
    projects = []
    if "Project" in text:
        # Heuristic: Find section between 'Project' and next major header
        # This is simplified. Proper sectioning requires stateful parsing.
        pass

    # 4. Weakness Detection
    weaknesses = []
    if len(found_skills) < 5:
        weaknesses.append("Very few technical skills identified.")
    if "Project" not in text:
        weaknesses.append("No 'Projects' section found in the resume.")
    if len(education) == 0:
        weaknesses.append("Education details might be missing or hard to read.")

    return {
        "skills": list(set(found_skills)), # Unique skills
        "education": education,
        "projects": projects,
        "experience": [],
        "weaknesses": weaknesses
    }
