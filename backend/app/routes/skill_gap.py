"""
routes/skill_gap.py – Skill gap analysis endpoints.
Blueprint prefix: /api/skill-gap
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.skill_gap import SkillGap

skill_gap_bp = Blueprint("skill_gap", __name__)

@skill_gap_bp.route("/matrix", methods=["GET"])
@jwt_required()
def get_all_gaps():
    """
    GET /api/skill-gap/
    Return all skill gap reports for the current user's latest resume across all domains.
    """
    user_id = get_jwt_identity()
    gaps = SkillGap.objects(user=user_id).order_by("-created_at")
    
    # We only want the latest gap report for each domain
    latest_gaps = {}
    for gap in gaps:
        if gap.domain not in latest_gaps:
            latest_gaps[gap.domain] = gap.to_dict()
            
    return jsonify({
        "success": True,
        "isAnalyzed": len(list(latest_gaps.values())) > 0,
        "skill_gaps": list(latest_gaps.values())
    }), 200

@skill_gap_bp.route("/<domain>", methods=["GET"])
@jwt_required()
def get_domain_gap(domain):
    """
    GET /api/skill-gap/<domain>
    Return the latest skill gap report for a specific domain.
    """
    user_id = get_jwt_identity()
    gap = SkillGap.objects(user=user_id, domain=domain).order_by("-created_at").first()
    
    if not gap:
        return jsonify({"error": f"No skill gap analysis found for domain: {domain}"}), 404
        
    return jsonify({
        "success": True,
        "isAnalyzed": True,
        "skill_gap": gap.to_dict()
    }), 200
