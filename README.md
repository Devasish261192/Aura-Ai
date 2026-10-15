# 🌟 Aura AI

> **The Autonomous Career Intelligence & Executive Presence Operating System**  
> *Transform your career experiences into canonical intelligence, tailored ATS resumes, and commanding interview performances.*

---

## ⚡ Overview

**Aura AI** is a next-generation career intelligence platform designed to replace generic resume builders and chat wrappers. Powered by **FastAPI**, **React 19**, **Google Gemini**, and **MediaPipe AI**, Aura acts as an autonomous executive career agent.

It ingests raw career experiences, normalizes them into a canonical **Career Vault**, compiles pixel-perfect ATS-optimized resumes via native OpenXML Word automation, and coaches candidates to executive-level communication using structured frameworks (such as Yasir Khan's 4-Part CEO Pitch Model) combined with real-time computer vision studio feedback.

```
                  ┌────────────────────────────────────────┐
                  │            AURA AI PLATFORM            │
                  └──────────────────┬─────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Canonical Vault  │       │  CV Forge Studio │       │ Executive Studio │
│ • profile_master │       │ • Real-time Sync │       │ • MediaPipe ML   │
│ • career_story   │──────►│ • OpenXML .docx  │       │ • Dot & Dash WPM │
│ • skills_matrix  │       │ • Vector PDF     │       │ • Model-A Pitch  │
│ • traits         │       │ • ATS Optimizer  │       │ • Virtual Studio │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## ✨ Key Capabilities

### 1. 🏛️ Canonical Career Vault (Single Source of Truth)
- **Zero Hallucination:** Normalizes work history, achievements, and technical projects into immutable, schema-validated JSON artifacts (`profile_master.json`, `career_story.json`, `skills_matrix.json`, `traits.json`).
- **STARR Case Studies:** Automatically structures complex engineering and leadership stories using the Situation, Task, Action, Result, and Learnings methodology.
- **Smart CV Timeline Extractor:** 1-click extractor that reads PDF/DOCX resumes and maps chronology, responsibilities, and gap phases with resilient AI parsing.

### 2. 📝 CV Forge Studio (Real-Time Document Engine)
- **Native OpenXML Word Generation:** Directly generates native Microsoft Word (`.docx`) documents with clean typography, invisible alignment tables, and zero ATS rendering issues.
- **Word COM Vector PDF Export:** Automates high-fidelity PDF rendering via Microsoft Word COM automation.
- **Dynamic Track Tailoring:** Instantly pivots candidate profile between targeted career tracks (e.g., Technical Business Analyst, Application Support Lead, Data & Analytics Architect, Systems & AI Engineer).

### 3. 🎙️ Executive Presence Studio & Rhythm Teleprompter
- **Yasir Khan 4-Part CEO Pitch Trainer:** Structured coaching on Hook, Target Problem, Engineered Solution, and Moat/Vision.
- **Dot & Dash Rhythm Teleprompter:** Pacing indicator that regulates words-per-minute (WPM), enforces downward inflection, and commands deliberate silence pauses between pillars.
- **MediaPipe AI Virtual Studio:** Real-time client-side neural selfie segmentation for executive background blur, lighting presets, and confidence metrics.

### 4. 🧠 Multi-Tier Resilient AI Orchestrator
- **Fail-Safe Inference:** Dynamically cascades from primary Google Gemini models (`gemini-2.5-flash`) down through resilient fallbacks (`gemini-2.5-flash-lite`, Groq Llama-3, Mistral).
- **Structured Tool Registry:** Backend agents utilize strict function calling for artifact mutation, database synchronization, and market matching.

### 5. 🎯 Job Intelligence & Referral Automation
- **Target Track Scoring:** Evaluates market job descriptions against your canonical vault and calculates dimensional alignment scores.
- **One-Click Outreach & Pitches:** Generates tailored recruiter outreach scripts and executive cover letters for targeted roles.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Lucide Icons, MediaPipe Vision |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2, Python-Docx, PyPDF, SQLite3 |
| **AI / LLM** | Google Gemini API (`google-genai`), Groq Llama-3, Mistral AI |
| **Document Automation** | OpenXML (Word `.docx`), Microsoft Word COM Automation (PDF Export) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**
- **Git**
- Microsoft Word installed (required for native COM PDF rendering; fallback docx export works without Word)

### 1. Clone the Repository
```bash
git clone https://github.com/Devasish261192/Aura-Ai.git
cd Aura-Ai
```

### 2. Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Open `.env` in your editor and configure your API keys:
```env
# Required for AI features:
GEMINI_API_KEY=your_gemini_api_key_here

# Optional:
GROQ_API_KEY=your_groq_key
MISTRAL_API_KEY=your_mistral_key
SERP_API_KEY=your_serp_key
```

### 3. One-Click Launch (Windows)
Double-click `start_aura.bat` in the project root, or execute:
```cmd
start_aura.bat
```
This automatically boots both the backend API server (`http://localhost:8000`) and the frontend interface (`http://localhost:5173`).

---

## 💻 Manual Setup

If you prefer running services independently:

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with live reload
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

### Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
Access the application at: `http://localhost:5173`

---

## 📂 Repository Directory Structure

```
Aura-Ai/
├── .env.example              # Environment configuration template
├── .gitignore                # Production security & artifact exclusion rules
├── README.md                 # Complete platform documentation
├── start_aura.bat            # 1-click master launcher (Windows)
├── run_backend.bat           # Dedicated backend launcher
├── run_frontend.bat          # Dedicated frontend launcher
│
├── backend/
│   ├── requirements.txt      # Python package dependencies
│   └── app/
│       ├── main.py           # FastAPI entrypoint & middleware
│       ├── config.py         # Global configuration & paths
│       ├── database.py       # SQLite connection & schema helpers
│       ├── routers/
│       │   ├── resume.py     # CV Forge, export, and parsing endpoints
│       │   ├── chat.py       # Conversational AI & SSE streaming
│       │   ├── jobs.py       # Job scoring and market search
│       │   └── artifacts.py  # Canonical vault artifact queries
│       ├── services/
│       │   ├── ai_service.py           # Multi-model Gemini orchestrator
│       │   ├── resume_service.py       # Word .docx & COM PDF compiler
│       │   ├── cv_extractor_service.py # PDF/DOCX text & timeline extraction
│       │   ├── jobs_service.py         # Job matching & cover letters
│       │   └── artifact_service.py     # Atomic JSON vault operations
│       └── tools/
│           └── registry.py   # AI tool calling registry
│
├── frontend/
│   ├── index.html            # Main HTML document
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.ts        # Vite build configuration
│   └── src/
│       ├── App.tsx           # Main application view switcher
│       ├── components/
│       │   ├── Artifacts/    # Canonical Vault viewer & timeline modal
│       │   ├── CVForge/      # Live split-pane resume editor
│       │   ├── Jobs/         # Market job match explorer
│       │   ├── Studio/       # Virtual camera studio & recording
│       │   ├── Trainer/      # Yasir Khan CEO Model pitch trainer
│       │   └── Chat/         # Executive AI Co-Pilot chat
│       └── store/
│           └── useAppStore.ts # Central Zustand client store
│
└── data/                     # Local data directory (auto-created, gitignored)
```

---

## 🔒 Security & Privacy by Design

Aura AI is built around data sovereignty:
- **No Cloud Database Lock-in:** All career vault artifacts and databases are stored locally in your workspace's `data/` directory.
- **Zero PII Exposure:** Personal resumes, cover letters, and `.env` credentials are strictly ignored via `.gitignore`.
- **Stateless Execution:** Your personal career stories are processed in memory and never transmitted to external databases outside direct LLM inference calls you initiate.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
