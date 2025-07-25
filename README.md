# Chatbot Project

A **Flask-based AI chatbot** powered by **Google Gemini**. Supports document uploads (`.txt`, `.pdf`, `.docx`) via **textract**, is **Dockerized**, and is deployable to **AWS EKS** using **Terraform** with CI/CD via **Jenkins**.

---

## Features
- **Flask web app** with REST endpoints for chat and file upload.
- **Google Gemini API** for text generation.
- **File extraction** with `textract` (max 5 MB, whitelisted extensions).
- **AWS-ready IaC**: Terraform modules for **VPC**, **EKS**, and **KMS** encryption.
- **CI/CD pipeline**: `jenkinsfile` builds, tests, and deploys Docker images to EKS.
- **Secure defaults**: env-based secrets, upload size limits, and VPC isolation.

---

## Project Structure
```
chatbot_project/
├── app.py              # Flask app
├── Dockerfile          # Container build
├── jenkinsfile         # CI/CD pipeline
├── terraform/          # AWS infra (VPC, EKS, KMS)
├── templates/          # HTML templates
├── static/             # CSS/JS
└── uploads/            # User uploads
```

---

## Environment Variables (`.env`)
```env
FLASK_SECRET_KEY=your_flask_secret
GEMINI_API_KEY=your_gemini_api_key
```

---

## Quick Start (Local)
```bash
# Build & run
docker build -t chatbot_project .
docker run -p 5000:5000 --env-file .env chatbot_project
```

---

## Deploy on AWS (Terraform + Jenkins)
1. **Provision infra**:
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```
2. **Pipeline**: Configure Jenkins to:
   - Build Docker image
   - Push to your registry
   - Apply K8s manifests to the **EKS** cluster

---

## Tech Stack
**Flask**, **Google Gemini (google.generativeai)**, **Textract**, **Docker**, **Terraform (AWS: EKS, VPC, KMS)**, **Jenkins**.

---


