"""
seed_data.py – Utility script to seed the initial courses into MongoDB.
Run this once after the backend is setup.
"""
import mongoengine
from app.models.course import Course
from app.config import Config

# Connect to MongoDB
mongoengine.connect(host=Config.MONGO_URI)

# Clear existing courses
Course.objects.delete()

courses = [
    # Web Development
    {
        "title": "Complete React Developer in 2024",
        "domain": "Web Development",
        "skill_covered": "React",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/complete-react-developer-zero-to-mastery/",
        "type": "course",
        "level": "intermediate"
    },
    {
        "title": "The Web Developer Bootcamp",
        "domain": "Web Development",
        "skill_covered": "HTML",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/the-web-developer-bootcamp/",
        "type": "course",
        "level": "beginner"
    },
    {
        "title": "Node.js API Masterclass",
        "domain": "Web Development",
        "skill_covered": "Node.js",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/nodejs-api-masterclass-express-mongodb/",
        "type": "course",
        "level": "advanced"
    },

    # Data Science
    {
        "title": "Machine Learning Specialization",
        "domain": "Data Science",
        "skill_covered": "Machine Learning",
        "platform": "Coursera",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "type": "course",
        "level": "intermediate"
    },
    {
        "title": "Data Analysis with Python",
        "domain": "Data Science",
        "skill_covered": "Pandas",
        "platform": "FreeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/",
        "type": "course",
        "level": "beginner"
    },
    {
        "title": "Deep Learning Specialization",
        "domain": "Data Science",
        "skill_covered": "Deep Learning",
        "platform": "DeepLearning.AI",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "type": "course",
        "level": "advanced"
    },

    # Cloud Computing
    {
        "title": "AWS Certified Solutions Architect",
        "domain": "Cloud Computing",
        "skill_covered": "AWS",
        "platform": "A Cloud Guru",
        "url": "https://acloudguru.com/course/aws-certified-solutions-architect-associate",
        "type": "certification",
        "level": "intermediate"
    },
    {
        "title": "Docker and Kubernetes: The Complete Guide",
        "domain": "Cloud Computing",
        "skill_covered": "Docker",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
        "type": "course",
        "level": "beginner"
    }
]

for course_data in courses:
    Course(**course_data).save()

print(f"Successfully seeded {len(courses)} courses into MongoDB.")
