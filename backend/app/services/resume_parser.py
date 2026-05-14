"""
services/resume_parser.py – Extracts raw text from PDF resumes.
"""
import pdfplumber

def extract_text_from_pdf(file_path):
    """
    Extracts all text content from a PDF file using pdfplumber.
    """
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""
        
    return text.strip()
