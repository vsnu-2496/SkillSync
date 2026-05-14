"""
run.py – Entry point for SkillSync AI Flask backend.
Run with: python run.py
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    # Debug mode is enabled for development; set to False in production
    app.run(debug=True, port=5000)
