import os
from flask import Flask, render_template, request, jsonify, send_from_directory, session
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import google.generativeai as genai
import textract  # For extracting content from various file formats

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default-secret")
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB max file size
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {"txt", "pdf", "docx"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Gemini API setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "").strip()
    if not user_message:
        return jsonify({"response": "Please enter a message."})

    try:
        file_context = session.get("file_content", "")
        prompt = (
            "You are a helpful programming assistant. Use markdown formatting. "
            + (f"\nHere is the uploaded file content:\n{file_context}\n\n" if file_context else "")
            + f"User asked: {user_message}"
        )

        model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-lite")
        response = model.generate_content(prompt)
        return jsonify({"response": response.text if hasattr(response, "text") else "No response from Gemini."})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})

@app.route("/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"message": "No file part in the request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No selected file."}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Unsupported file type."}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        content = textract.process(filepath).decode("utf-8")
        session["file_content"] = content[:10000]  # Trim to prevent excessive prompt size
        message = f"File '{filename}' uploaded and processed successfully!"
    except Exception as e:
        session["file_content"] = ""
        message = f"File uploaded but failed to process: {str(e)}"

    return jsonify({"message": message})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
