# Aura Career Engine (Version 1.0) — Master Technical Action Plan

**System Specification, Phased Engineering Roadmap & Low-Resource Deployment Blueprint**  
*Document Version: 1.0.0 | Date: October 2026 | Environment: 1 vCPU, 1 GB RAM Cloud + Local Client*

---

## 1. Architectural Strategy for Low-Resource Cloud (1 vCPU, 1 GB RAM)

Operating reliably within **1 vCPU and 1 GB RAM** requires eliminating heavy server runtimes (No Node.js SSR servers, No in-memory vector databases, No headless server Chrome/Playwright instances). 

### 1.1 Memory Budget Allocation (Target: < 250 MB Total RAM)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   1 GB RAM CLOUD SERVER BUDGET                         │
├────────────────────────────────────────────────────────────────────────┤
│ OS + Kernel (Ubuntu 24.04 LTS minimal)               : ~120 MB RAM     │
│ Nginx (Reverse Proxy & Static Web Host)             : ~15 MB RAM      │
│ Lean Python FastAPI Backend (Single Uvicorn worker)  : ~75 MB RAM      │
│ SQLite WAL Mode (Database Engine)                   : ~10 MB RAM      │
│ System Buffer & In-Flight Request Margin             : ~60 MB RAM      │
├────────────────────────────────────────────────────────────────────────┤
│ TOTAL SYSTEM FOOTPRINT                              : ~280 MB / 1024 MB│
│ SAFETY HEADROOM (FREE MEMORY)                       : ~740 MB (72%)    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Resource Protection Safeguards
1. **Client-Side SPA Architecture:** Build the web frontend with **Vite + React 19 + TypeScript + Tailwind CSS** as a pure static bundle (`dist/`). Nginx serves these static HTML/JS/CSS assets with near-zero CPU and negligible memory.
2. **Swap File Configuration:** A 2 GB swap file (`/swapfile`) will be configured on the server to prevent Linux OOM (Out Of Memory) killer crashes during builds or bursts.
3. **Streaming AI Responses:** Use Server-Sent Events (SSE) / streaming HTTP responses from Google GenAI (`gemini-1.5-flash`) so prompts are not buffered in server memory.
4. **Local Document & Video Processing:** Heavy document rendering (Playwright/Chromium PDF export) and high-bitrate video recording run **client-side** (in the browser or local client), never on the 1 GB cloud VPS.

---

## 2. Technology Stack Selection

| Component | Selected Technology | Rationale & Resource Impact |
|---|---|---|
| **Web Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Lucide | 0 MB server RAM (compiled to static assets served by Nginx). |
| **Voice Input** | Web Speech API (`webkitSpeechRecognition`) | 0 server compute; native, free, real-time dictation in Chrome. |
| **State Management** | Zustand | Lightweight client-side reactive store for chat, artifacts, and resume. |
| **Backend API** | Python 3.12 + FastAPI + Uvicorn (Single Worker) | <80 MB RAM footprint; native async, streaming support. |
| **Database** | SQLite 3 (WAL mode) | Embedded, zero server daemon overhead, ACID transactions. |
| **AI Engine** | Google Gemini 1.5 Flash via REST | Sub-second latency, lowest token cost, zero local model memory. |
| **Artifact Storage** | JSON File System + SQLite Relational Index | Canonical, versioned JSON records with deterministic schema handlers. |

---

## 3. Phased Implementation Roadmap

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           AURA 1.0 PHASE ROADMAP                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: Chat Agent with Voice Input & Deterministic JSON Artifacts Engine       │
│ PHASE 2: CV Forge Multi-Profile Canvas (App Support, Business Analyst, Data)     │
│ PHASE 3: Pitch Studio: Video Resume Scripts, "Tell Me About Yourself", Cover Ltr │
│ PHASE 4: Multi-Channel Job Sourcing (SERP API, Telegram Referrals, Portal Sync)  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Chat Agent, Voice Dictation & JSON Artifacts Engine

### 1. Objective
Build an interactive conversational agent where the user can speak (via voice dictation) or type to answer guided career questions. The agent does not simply generate unstructured text; it invokes deterministic backend tools to populate structured, versioned **JSON Artifacts**.

### 2. Voice Input Architecture (Web Speech API)
* Integrated directly into the chat input bar with a microphone toggle button (`[Mic]`).
* Utilizes the browser's native `webkitSpeechRecognition`:
  * Continuous listening mode with interim results displayed in the input field.
  * Instant dictated editing: the user can speak whole paragraphs or dictate specific bullet revisions.
  * Zero latency, zero cloud audio processing cost, zero server CPU load.

### 3. JSON Artifacts Schema Specification
Artifacts are stored in `data/artifacts/user_{id}/` with relational backups in SQLite:

```
data/artifacts/user_1/
├── career_story.json        # Raw narrative, incident RCAs, metrics, project facts
├── traits.json              # Evaluated competencies & behavioral strengths
├── profile_master.json      # Structured candidate profile (Experience, Education)
└── skills_matrix.json       # Categorized skills tagged by relevance
```

#### Canonical JSON Structure (`career_story.json`):
```json
{
  "version": 1,
  "updated_at": "2026-10-08T08:00:00Z",
  "candidate": {
    "name": "Aura Candidate",
    "location": "India",
    "contact": { "email": "candidate@example.com", "phone": "+1 (555) 000-0000", "linkedin": "linkedin.com/in/candidate" }
  },
  "experiences": [
    {
      "id": "exp_evolent_01",
      "company": "Evolent Health",
      "role": "Senior Analyst / Application Support Lead",
      "period": "2021 - Present",
      "domain": "Healthcare IT & Statutory Operations",
      "stories": [
        {
          "id": "story_rca_01",
          "title": "Production Database Discrepancy RCA",
          "situation": "Critical discrepancy in claims processing pipeline impacting client SLAs.",
          "task": "Perform root cause analysis and restore database integrity under 24/7 uptime pressure.",
          "action": "Implemented SQL diagnostic scripts, optimized indexing, and established automated health alerts.",
          "result": "Reduced SLA breaches by 42% and eliminated upstream data corruption.",
          "metrics": ["42% SLA reduction", "10,000+ daily transactions protected"],
          "applicable_roles": ["app_support_lead", "data_analyst"]
        }
      ]
    }
  ],
  "traits": {
    "core_strengths": ["Incident Triage", "SQL RCA", "SLA Governance", "Cross-functional Coordination"],
    "work_style": ["Resilient under pressure", "Data-driven investigator"]
  }
}
```

### 4. Deterministic Agent Tool Handlers
The agent is equipped with strict tool calling schemas. The agent never claims an update is made unless the handler successfully commits the JSON payload:
* `save_career_story_entry`: Appends or updates a verified project/incident narrative.
* `compile_candidate_traits`: Synthesizes the story into core competencies and traits.
* `update_skills_matrix`: Categorizes technical and functional skills with proficiency levels.
* `get_artifact_state`: Reads current stored JSON to provide verified context to the model.

---

## Phase 2: CV Forge Multi-Profile Engine

### 1. Objective
Transform the verified JSON Artifacts into tailored, A4-budgeted resumes across the candidate's three qualifying career tracks.

### 2. The Three Target Profiles
The candidate's unified career story maps into 3 distinct resume profiles:

```
                              CANONICAL CAREER STORY (JSON)
                                            │
                     ┌──────────────────────┼──────────────────────┐
                     ▼                      ▼                      ▼
           PROFILE 1:                     PROFILE 2:             PROFILE 3:
     APPLICATION SUPPORT LEAD          BUSINESS ANALYST         DATA ANALYST
     • 24/7 Production Uptime          • BRD & Process Flows    • SQL / Python Analytics
     • Incident Triage & RCA           • GRC / Statutory Portal • Telemetry & Dashboards
     • SLA Governance & Bridges        • Stakeholder Alignment  • Pipeline Verification
```

### 3. CV Forge WYSIWYG Canvas
* **No Iframes:** Rebuilt as a pure React 19 component inside the single-page application tree.
* **Track Switcher:** A 1-click tab toggle (`[App Support Lead]`, `[Business Analyst]`, `[Data Analyst]`) that re-renders the canvas instantly using track-specific lens weights from the JSON store.
* **Strict A4 Print Engine:** Dual-column 210mm $\times$ 297mm layout with strict overflow budget indicators.
* **Export Pipeline:**
  * Clean `.docx` export using pure OOXML / `docx` generation.
  * Calibrated vector PDF export with zero font-weight thickening bugs.

---

## Phase 3: Pitch Studio — Video Resume, "Tell Me About Yourself" & Cover Letters

### 1. Objective
Prepare the candidate for interview execution by generating high-impact speaking scripts and tailored application assets derived directly from the candidate's verified story.

### 2. Core Modules
1. **Video Resume Elevator Pitch Scripts (60 Seconds):**
   * Pacing-calibrated scripts (approx. 130–145 words) tailored for each of the 3 profiles.
   * Teleprompter integration in Chrome with scrolling speed controls and webcam preview.
2. **"Tell Me About Yourself" Executive Framework:**
   * Structured according to the **Past $\to$ Present $\to$ Future** framework:
     * *Past:* Proven foundation in mission-critical applications and data workflows.
     * *Present:* High-leverage achievements, incident resolution, and business impact.
     * *Future:* Target alignment with the specific hiring manager's problem statement.
3. **Role-Targeted Cover Letter Generator:**
   * 1-Click generation of crisp, 250-word cover letters highlighting the exact STAR story most relevant to the target role.

---

## Phase 4: Multi-Channel Job Sourcing & Referral Engine

### 1. Objective
Automate and streamline discovery across open web job search APIs, specialized Telegram tech channels, and recruiter networks.

### 2. Core Modules
1. **SERP API Job Ingestion:**
   * Automated search querying Google Jobs for target queries:
     * *"Senior Application Support Lead Remote / Hybrid"*
     * *"Technical Business Analyst Healthcare IT"*
     * *"Data Operations Analyst SQL Python"*
   * Normalizes jobs into a uniform schema (`title`, `company`, `location`, `salary`, `description`, `apply_url`).
2. **Telegram Job Scraper & Referral Matcher:**
   * Re-architected from `version 0.0` scripts (`telegram_job_scraper.py`, `telegram_referral_matcher.py`).
   * Listens to selected tech job broadcast groups and employee referral networks.
   * Compares incoming referral posts against candidate profile traits, generating instant match alerts.
3. **Multi-Portal Browser Companion:**
   * Chrome Side Panel companion reading active job postings on LinkedIn, Naukri, and corporate career portals (Workday, Greenhouse, Lever).
   * User-initiated capture (highlight/click) matching the target JD against the 3 resume profiles to recommend the highest-scoring track.

---

## 4. Immediate Step-by-Step Execution Plan

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       STEP-BY-STEP TECHNICAL TASKS                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ TASK 1: Workspace & Directory Scaffold                                       │
│ • Create clean monorepo in `version 1.0/` with `frontend/`, `backend/`,      │
│   and `data/artifacts/`.                                                     │
│                                                                              │
│ TASK 2: Lightweight FastAPI Backend (Cloud Ready)                            │
│ • Set up FastAPI app with CORS, SQLite WAL database, and Pydantic schemas.   │
│ • Implement Gemini 1.5 Flash client with streaming support and tools.        │
│                                                                              │
│ TASK 3: Deterministic JSON Artifact Storage Engine                           │
│ • Build tool handlers: `save_story`, `update_traits`, `get_artifacts`.       │
│ • Implement file-based JSON persistence with SQLite index.                   │
│                                                                              │
│ TASK 4: React 19 + Vite Frontend Shell                                       │
│ • Initialize Vite + React 19 + TypeScript + Tailwind CSS.                   │
│ • Build Chat UI with streaming message bubbles and tool status chips.        │
│                                                                              │
│ TASK 5: Web Speech API Voice Dictation                                       │
│ • Add speech recognition hook (`useSpeechRecognition`) with mic toggle.      │
│ • Test real-time dictation into the chat input bar.                          │
│                                                                              │
│ TASK 6: End-to-End Phase 1 Verification                                      │
│ • Dictate career experience via voice -> Agent processes -> Tools update     │
│   `career_story.json` -> UI displays confirmed artifact updates.             │
└──────────────────────────────────────────────────────────────────────────────┘
```
