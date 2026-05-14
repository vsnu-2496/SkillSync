"""
routes/career.py – Career domain recommendation endpoints.
Blueprint prefix: /api/career
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.resume import Resume
from app.models.recommendation import Recommendation
from app.services.career_matcher import DOMAIN_TEMPLATES

career_bp = Blueprint("career", __name__)


@career_bp.route("/recommendations", methods=["GET"])
@jwt_required()
def get_recommendations():
    """
    GET /api/career/recommendations
    Return the latest career domain recommendations for the current user.
    Sorted by confidence score descending.
    """
    user_id = get_jwt_identity()

    # Get the most recently generated recommendation
    rec = Recommendation.objects(user=user_id).order_by("-generated_at").first()

    if not rec:
        return jsonify({
            "error": "No recommendations yet. Please upload your resume first."
        }), 404

    # Sort domains by confidence score (highest first)
    sorted_domains = sorted(rec.domains, key=lambda d: d["confidence_score"], reverse=True)

    return jsonify({
        "success": True,
        "recommendations": sorted_domains
    }), 200


@career_bp.route("/domains", methods=["GET"])
def list_domains():
    """
    GET /api/career/domains
    Return a list of all supported career domains and their required skills.
    This is a public endpoint (no auth required).
    """
    domains = [
        {"name": domain, "required_skills": skills}
        for domain, skills in DOMAIN_TEMPLATES.items()
    ]
    return jsonify({"domains": domains}), 200
