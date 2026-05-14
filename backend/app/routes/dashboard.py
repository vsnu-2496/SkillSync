"""
routes/dashboard.py – Aggregated metrics for the main dashboard.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.resume import Resume
from app.models.skill_gap import SkillGap
from app.models.recommendation import Recommendation

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
        
    # Calculate Prep Readiness (formula: matchPercentage * 0.6 + performanceScore * 0.4)
    prep_readiness = round((user.matchPercentage * 0.6) + (user.performanceScore * 0.4))
    
    # Construct response matching frontend expectations
    return jsonify({
        "success": True,
        "data": {
            "userName": user.name,
            "metrics": {
                "careerSynergy": user.matchPercentage,
                "prepReadiness": prep_readiness,
                "performanceScore": user.performanceScore,
                "criticalDeficits": len(user.skillGaps),
                "targetCompanies": 12 # Placeholder or dynamic
            },
            "skills": user.skills,
            "topRole": user.topRole if user.topRole else "Not Analyzed",
            "skillGaps": user.skillGaps[:5] if user.skillGaps else ["System Design", "Cloud Architecture", "Unit Testing"],
            "recentActivity": user.recentActivity[::-1], # Newest first
            "recentVault": [],
            "companyMatches": [
                { "name": "Google", "match": min(user.matchPercentage + 5, 100), "color": "#4285F4" },
                { "name": "Amazon", "match": user.matchPercentage, "color": "#FF9900" },
                { "name": "Microsoft", "match": max(user.matchPercentage - 10, 60), "color": "#00A4EF" }
            ]
        }
    }), 200
