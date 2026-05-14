"""
routes/resume.py – Handles PDF upload, parsing, and resume retrieval.
Blueprint prefix: /api/resume
"""
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.models.user import User
from app.models.resume import Resume
from app.services.resume_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills_and_sections
from app.services.career_matcher import generate_recommendations
from app.services.gap_analyzer import analyze_gaps

resume_bp = Blueprint("resume", __name__)


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension (PDF only)."""
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


@resume_bp.route("/analyze", methods=["POST"])
@jwt_required()
def upload_resume():
    """
    POST /api/resume/analyze
    Accept a PDF file, extract skills and sections, store results in MongoDB.
    Form data: resume (PDF)
    """
    user_id = get_jwt_identity()
    user    = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Validate file presence
    if "resume" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["resume"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Please upload a valid PDF file"}), 400

    # Save file temporarily
    filename    = secure_filename(file.filename)
    upload_dir  = current_app.config["UPLOAD_FOLDER"]
    file_path   = os.path.join(upload_dir, filename)
    file.save(file_path)

    # ------ STEP 1: Extract raw text from PDF ------
    raw_text = extract_text_from_pdf(file_path)

    # ------ STEP 2: Extract skills, education, projects ------
    parsed = extract_skills_and_sections(raw_text)

    # ------ STEP 3: Save resume document ------
    resume = Resume(
        user       = user,
        file_name  = filename,
        raw_text   = raw_text,
        skills     = parsed["skills"],
        education  = parsed["education"],
        projects   = parsed["projects"],
        experience = parsed["experience"],
        weaknesses = parsed["weaknesses"],
        status     = "processed",
    )
    resume.save()

    # ------ STEP 4: Generate career recommendations & skill gaps ------
    rec = generate_recommendations(user, resume)
    analyze_gaps(user, resume)

    # ------ STEP 5: Update User profile with latest metrics ------
    if rec and rec.domains:
        # Find best domain
        best_domain = max(rec.domains, key=lambda d: d["confidence_score"])
        
        user.skills = resume.skills
        user.topRole = best_domain["domain"]
        user.matchPercentage = int(best_domain["confidence_score"])
        user.skillGaps = best_domain["missing_skills"]
        
        # Add to recent activity
        activity_msg = f"Analyzed resume: {user.topRole} ({user.matchPercentage}%)"
        if activity_msg not in user.recentActivity:
            user.recentActivity.append(activity_msg)
            # Keep only last 10 activities
            user.recentActivity = user.recentActivity[-10:]
            
        user.save()

    # Clean up the uploaded file after processing
    os.remove(file_path)

    return jsonify({"message": "Resume processed successfully", "resume": resume.to_dict()}), 201


@resume_bp.route("/", methods=["GET"])
@jwt_required()
def get_latest_resume():
    """
    GET /api/resume/
    Return the most recent resume analysis for the current user.
    """
    user_id = get_jwt_identity()
    resume  = Resume.objects(user=user_id).order_by("-upload_date").first()

    if not resume:
        return jsonify({"error": "No resume found. Please upload your resume."}), 404

    return jsonify({"resume": resume.to_dict()}), 200


@resume_bp.route("/history", methods=["GET"])
@jwt_required()
def resume_history():
    """
    GET /api/resume/history
    Return all resume uploads for the current user (newest first).
    """
    user_id = get_jwt_identity()
    resumes = Resume.objects(user=user_id).order_by("-upload_date")

    return jsonify({"resumes": [r.to_dict() for r in resumes]}), 200
