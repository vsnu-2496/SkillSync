"""
routes/courses.py – Course and project recommendation endpoints.
Blueprint prefix: /api/courses
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.course import Course
from app.models.skill_gap import SkillGap

courses_bp = Blueprint("courses", __name__)

@courses_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_course_recommendations():
    """
    GET /api/courses/recommendations
    Suggest courses based on the missing skills in the user's latest skill gap report.
    Optional query param: ?domain=Web+Development
    """
    user_id = get_jwt_identity()
    domain = request.args.get("domain")
    
    query = {"user": user_id}
    if domain:
        query["domain"] = domain
        
    latest_gap = SkillGap.objects(**query).order_by("-created_at").first()
    
    if not latest_gap:
        return jsonify({"error": "No skill gap data found. Please analyze your resume first."}), 404
        
    missing_skills = latest_gap.missing_skills
    
    # Find courses that cover these missing skills
    recommended_courses = Course.objects(skill_covered__in=missing_skills)
    
    return jsonify({
        "success": True,
        "domain": latest_gap.domain,
        "missing_skills": missing_skills,
        "recommendations": [c.to_dict() for c in recommended_courses]
    }), 200

@courses_bp.route("/all", methods=["GET"])
def get_all_courses():
    """
    GET /api/courses/all
    Return a list of all available courses in the database.
    Query params for filtering: ?domain=...&type=...
    """
    domain = request.args.get("domain")
    resource_type = request.args.get("type") # course | project | certification
    
    query = {}
    if domain: query["domain"] = domain
    if resource_type: query["type"] = resource_type
    
    courses = Course.objects(**query)
    return jsonify({
        "success": True,
        "courses": [c.to_dict() for c in courses]
    }), 200
