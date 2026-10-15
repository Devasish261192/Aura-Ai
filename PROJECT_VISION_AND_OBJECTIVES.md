# Aura Career Engine — Project Vision & Objectives (Version 0.0 & Version 1.0)
**Architectural Retrospective, Core Philosophy, and Production Blueprint**  
*Document Version: 1.0.0 | Date: October 2026 | Author: Devasish Bindani*

---

## 1. Executive Vision: What is Aura?

**Aura** is the world’s first local-first, privacy-respecting **Personal Career Operating System**. 

The modern hiring market is broken and exhausting. A mid-to-senior professional seeking career mobility is currently forced to juggle 5 to 7 disconnected tools—fighting with Word margins, pasting blind prompts into ChatGPT, tracking applications in neglected spreadsheets, recording nervous mock interviews on phone cameras, and risking their personal contact data on web resume builders.

**Aura unifies the entire career lifecycle into one native desktop engine:**
1. **Precision Resume Customization (CV Forge):** Real-time JD re-alignment with native Microsoft Word (`.docx`) and pristine vector PDF exports.
2. **Behavioral & Technical Rehearsal (AI Interview Studio & Trainer):** Live scrolling teleprompter, webcam recorder, and structured STAR/CARL/PREP speech frameworks.
3. **Daily Execution Engine (30-Day Level-Up OS):** A gamified 5-step Standard Operating Procedure (SOP) backed by local SQLite.
4. **Living Career Story Vault:** A permanent, secure repository of verified project achievements, metrics, and architecture case studies.
5. **Compliance-Safe Browser Companion:** A Chrome Side Panel that analyzes job postings via user-controlled capture without violating platform terms.

---

## 2. Version 0.0: The Prototype & Discovery Phase

### 2.1 Original Objectives of Version 0.0
Version 0.0 was built as an exploratory prototype to validate the integration of AI career counseling, visual resume editing, webcam interview practice, and daily job search tracking.

* **Validate the Core Toolset:** Prove that a candidate could manage resumes, practice interviews, and track applications within a single desktop window.
* **A4 Print Precision:** Build a true-to-life A4 canvas in React that mirrors physical paper sheets.
* **Multi-Modal AI Assistance:** Embed an AI Counselor to act as an executive coach, answering questions and tailoring resume content.
* **Local-First Privacy:** Keep sensitive user files, video recordings, and SQLite databases stored locally on `127.0.0.1`.

---

### 2.2 What Version 0.0 Successfully Proven
1. **CV Forge Concept:** Validated that a two-column, A4-budgeted resume canvas with live inline editing is far superior to rigid web template builders.
2. **Native Word OpenXML & TrueType PDF Pipeline:** Discovered and solved the notorious Chromium "thick l/I" vector font bug by introducing backend Microsoft Word COM automation (`win32com.client`).
3. **AI Interview Studio:** Proved that pairing a scrolling teleprompter with a webcam feed dramatically reduces camera anxiety for technical candidates.
4. **30-Day Level-Up OS:** Established that gamifying the daily job-hunting routine (daily quotas, focus timers, XP points) keeps candidates consistent.
5. **Browser Side Panel Companion:** Built a Manifest V3 extension demonstrating user-controlled text capture for LinkedIn, Naukri, and open career portals.

---

### 2.3 Critical Failure Modes & Friction Points in Version 0.0
Despite proving the individual features, Version 0.0 revealed architectural flaws that made it unsuitable for commercial release:

#### 1. The Iframe Isolation & Dual State Disconnect (The "Fake Edit" Bug)
* **The Glitch:** When the user asked the Counselor: *"In key skills section I want top 15 skills only"*, the Counselor replied with enthusiasm: *"⚡ What Was Done: Curated and filtered the Key Skills section..."*, but the canvas remained frozen at `Key Skills (24)`.
* **Root Cause:** The Counselor UI ran in a parent HTML template, while CV Forge ran inside an isolated React `<iframe>`. Edits relied on fragile `window.postMessage()` events that frequently dropped.
* **Dual State Conflict:** CV Forge loaded its state from `localStorage` on initial mount, decoupling completely from disk files (`master_resume.json`). The AI was generating text descriptions of what it *intended* to do, but had no transactional mechanism to verify whether the React canvas actually re-rendered.

#### 2. The Python Runtime Dependency on End-User Machines
* Version 0.0 relied on a pre-installed Python 3.12 virtual environment on the host machine (`venv/Scripts/python.exe`).
* Normal consumers do not have Python installed. Expecting end users to configure Python runtimes, PATH variables, or dependencies is a total barrier to entry.

#### 3. Layout Ergonomics & Buried Controls
* The Counselor was squeezed into a narrow left sidebar, making detailed responses difficult to read at a glance.
* The chat input box collided with the bottom status bar.
* Settings and API configurations were scattered at the bottom of the interface rather than organized in a clean modal.

#### 4. BYOK (Bring Your Own Key) Friction
* Asking job seekers to register on Google AI Studio, obtain an API key, and manage rate limits introduced massive onboarding drop-off.
* Free-tier Gemini Pro caps at **2 requests/minute and 50 requests/day**, causing frequent `429 Too Many Requests` crashes during mock interviews.

---

## 3. Version 1.0: The Production & Commercial Phase

### 3.1 Version 1.0 Vision & Strategic Objectives
Version 1.0 is a **ground-up re-architecture** designed to transform the validated prototype into a rock-solid, commercial-grade desktop product ready to serve thousands of paying customers.

* **Objective 1: Zero "Fake" Edits (100% Deterministic State Mutation)**  
  Every AI action must be a verified, transactional state change. If the AI claims it reduced skills to 15, the reactive store must update and re-render the canvas with 0ms latency *before* the message displays.
* **Objective 2: Unified Single-Window Architecture**  
  Eliminate all iframe boundaries. The Counselor, CV Forge, Interview Studio, and 30-Day OS will share a single, reactive application state.
* **Objective 3: Zero-Install Standalone Desktop Binary**  
  The end user downloads a single installer (`AuraSetup.exe`). The Python backend is compiled into a standalone native binary (via PyInstaller/Nuitka) embedded directly into Electron. Zero Python required on the user's PC.
* **Objective 4: Silent Background Auto-Updates**  
  Implement `electron-updater` so updates, security patches, and new feature drops install silently in the background without manual website re-downloads.
* **Objective 5: Commercial SaaS & 90-Day Sprint Business Model**  
  Deliver a seamless, zero-setup onboarding experience powered by a thin OCI ARM Cloud AI Gateway, anchored around a **₹4,999 90-Day Sprint Pass** and an action-gated trial.

---

## 4. Technical Architecture Comparison: Version 0.0 vs. Version 1.0

| Architectural Layer | Version 0.0 (Prototype) | Version 1.0 (Commercial Production) |
|---|---|---|
| **Frontend Shell** | Electron embedding parent HTML + CV Forge in `<iframe>` | **Unified Single-Page App (React + Vite + TypeScript)** with zero iframes. |
| **State Management** | Fragmented: `localStorage` + `master_resume.json` + `postMessage` | **Central Reactive State Store (Zustand / Redux Toolkit)** as the Single Source of Truth (SSOT). |
| **AI Action Execution** | Text-first generation (AI outputs markdown claiming actions were done) | **Strict Function Calling (Deterministic Tool Engine):** AI executes validated functions (`set_skills`, `replace_project`) and only confirms once state emits `200 OK`. |
| **Python Runtime** | Requires host Python 3.12 + local `venv` | **Compiled Standalone Binary (`aura-backend.exe`)** bundled inside Electron. Zero external dependencies. |
| **Installer & Updates** | Manual git pull / npm scripts | **`electron-builder` (NSIS) + `electron-updater`** with delta patches from Cloudflare R2 / GitHub Releases. |
| **Layout Ergonomics** | Squeezed left sidebar (300px), hidden input bar | **Fluid Flexible Layout:** 50/50 split toggle, maximizeable Counselor, clean dedicated Settings modal. |
| **Cloud AI Gateway** | Direct BYOK (User enters raw Gemini key; hits free-tier rate limits) | **Managed Cloud Gateway (OCI ARM + Redis)**: Included fast Gemini 1.5 Flash processing with zero user setup. |

---

## 5. Version 1.0 Core System Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AURA 1.0 UNIFIED DESKTOP SHELL                       │
│                                                                        │
│  ┌───────────────────────────┐        ┌─────────────────────────────┐  │
│  │   AURA COUNSELOR ENGINE   │        │      CV FORGE CANVAS        │  │
│  │   • Conversational Chat   │        │   • Dynamic A4 WYSIWYG      │  │
│  │   • Strict Function Calls │◄──────►│   • TrueType Arial Export   │  │
│  │   • Speech Evaluator      │        │   • Word COM Vector PDF     │  │
│  └─────────────┬─────────────┘        └──────────────┬──────────────┘  │
│                │                                     │                 │
│                ▼                                     ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            CENTRAL REACTIVE STATE STORE (Single Source)          │  │
│  │     (Master Resume, Active Track, Job Pipeline, STAR Vault)      │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                 ┌───────────────────┴──────────────────┐               │
│                 ▼                                      ▼               │
│  ┌─────────────────────────────┐     ┌──────────────────────────────┐  │
│  │     AI INTERVIEW STUDIO     │     │      30-DAY LEVEL-UP OS      │  │
│  │  • Video Teleprompter       │     │   • SQLite Application Kanban│  │
│  │  • Webcam Recorder (Local)  │     │   • 5-Step Daily SOP Routine │  │
│  │  • STAR Framework Drills    │     │   • Focus Timer & Streaks    │  │
│  └─────────────────────────────┘     └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Module 1: The Deterministic Tool Engine
When the user speaks to the Counselor, the interaction follows a strict **Execute-Then-Confirm** lifecycle:
1. User: *"Reduce my skills to the top 15 for an Application Support Lead role."*
2. Counselor identifies the tool call: `update_skills_section(track="app_support", limit=15)`.
3. The Tool Engine mutates the central state store directly.
4. The React Canvas updates immediately on screen.
5. Counselor receives execution confirmation and outputs the summary note to the user.
6. **Result:** Zero discrepancy between chat dialogue and canvas state.

### Module 2: The Unified Workspace Layout
* **Default Mode (50/50 Balance):** Counselor takes left half (comfortable reading width for executive chats), CV Forge takes right half.
* **Counselor Maximize Mode:** Expand Counselor to full-screen when engaging in deep career coaching, mock interviews, or trait compiling.
* **Canvas Focus Mode:** Collapse Counselor to a slim floating dock when fine-tuning resume typography, section orders, or reviewing print previews.
* **Central Settings Hub:** API gateways, theme toggles, license keys, and export preferences consolidated into an accessible modal.

### Module 3: Zero-Install Packaging Pipeline
* The Python backend (FastAPI, python-docx, PyMuPDF, SQLite) is packaged using **PyInstaller / Nuitka** into `backend/aura-backend.exe`.
* Electron's `main.js` launches `aura-backend.exe` as an internal background process on startup.
* The installer (`AuraSetup.exe`) installs with one click on any Windows 10/11 machine.

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

| Metric | Target in Version 1.0 |
|---|---|
| **AI Edit Accuracy** | **100% Deterministic** (Zero un-applied or hallucinated changes). |
| **Canvas Re-render Latency** | **< 50 milliseconds** upon tool execution. |
| **Installation Friction** | **1-Click (.exe)** with zero user dependencies (No Python, No Node). |
| **Export Quality** | **100% TrueType Vector PDF & Clean Word .docx** (Zero font thickening bugs). |
| **Weekly Acquisition** | **20 to 30 paying users / week** on the ₹4,999 90-Day Sprint Pass. |
| **Gross Margin** | **> 98%** (OCI ARM Free Tier + ~₹25/mo Gemini Flash token cost). |

---

## 7. Version 1.0 Scaffolding Roadmap

```
STEP 1: REPOSITORIES & ENVIRONMENT INITIALIZATION
• Set up clean Git repository structure in version 1.0.
• Initialize unified frontend shell with Vite, React 19, TypeScript, and Tailwind CSS.
• Initialize clean Python backend module designed for PyInstaller compilation.

STEP 2: CENTRAL REACTIVE STORE & TOOL CALLING ENGINE
• Implement the unified state store (Zustand) managing Master Resume, Tracks, and Job Pipeline.
• Build deterministic Python/TypeScript tool handlers with strict schema validation.

STEP 3: CV FORGE UNIFIED INTEGRATION
• Migrate the calibrated A4 canvas directly into the React tree (eliminating iframes).
• Connect two-way data binding directly between Counselor actions and canvas elements.
• Re-integrate native Microsoft Word COM & vector PDF export engines.

STEP 4: AI INTERVIEW STUDIO & 30-DAY LEVEL-UP OS
• Integrate the video teleprompter and local recording vault.
• Wire the SQLite Kanban application tracker and 5-step daily routine.

STEP 5: ZERO-INSTALL PACKAGING & LAUNCH PREPARATION
• Compile backend to standalone executable via PyInstaller.
• Configure electron-builder NSIS installer and electron-updater.
• Deploy OCI Ampere A1 cloud gateway and Razorpay payment webhook.
```

---

## 8. Aura Bot & Job Agent Development Timeline (Phased Capability Evolution)

The Aura Bot is not a generic chatbot; it is an **Autonomous Career Co-Pilot and Pipeline Agent**. Its technical roadmap is split into 4 high-leverage development phases over 90 days:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   AURA BOT AGENTIC CAPABILITY ROADMAP                            │
├──────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 1 (Days 1–15)  : Deterministic Reactive Assistant (v1.0 Core Engine)     │
│  PHASE 2 (Days 16–30) : Proactive Accountability Coach & Mock Examiner (v1.1)    │
│  PHASE 3 (Days 31–60) : Smart Sourcing & Clipboard Co-Pilot (v1.2–v1.3)          │
│  PHASE 4 (Days 61–90) : Semi-Autonomous Job Agent & Multi-Agent Network (v2.0)  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1 (Days 1–15): The Deterministic Reactive Assistant (v1.0 Launch Baseline)
* **Core Focus:** 100% deterministic, zero-hallucination execution. Eliminating the v0.0 disconnect between AI dialogue and canvas state.
* **Key Bot Capabilities:**
  * **Transactional State Mutator:** The bot calls strict internal functions (`set_key_skills`, `tailor_summary`, `replace_project_bullets`, `switch_track`).
  * **Verified Feedback Loop:** The bot waits for a `200 OK` confirmation from the React store before outputting its response.
  * **Real-Time ATS Scanner:** Compares candidate's master career facts against captured JDs, calculating semantic alignment scores (50–95%) and flagging skill gaps.
  * **1-Click Recruiter Note Generator:** Contextually writes a 100-word executive connection pitch.
  * **Behavioral STAR Evaluator:** Analyzes candidate's written responses to behavioral questions and scores them against the STAR framework rubric.
* **Milestone Deliverable:** A completely reliable, zero-glitch assistant where every requested edit reflects instantly on the CV Forge canvas.

---

### Phase 2 (Days 16–30): Proactive Accountability Coach & Live Mock Examiner (v1.1)
* **Core Focus:** Shifting the bot from a passive tool to an active daily career coach that drives candidate consistency.
* **Key Bot Capabilities:**
  * **Scheduled Daily Standups:** Proactive morning check-ins at 9:00 AM (reminding the user of their 5-step daily routine) and evening reviews at 6:00 PM (logging scorecard focus hours and application quotas).
  * **Interactive Mock Interviewer:** In AI Interview Studio, the bot listens to candidate speech transcripts and dynamically asks intelligent follow-up questions:
    * *Example:* "You mentioned resolving 40+ high-severity discrepancies. What exact SQL indexing or stored procedure optimization eliminated the upstream data corruption?"
  * **Speech Cadence & Metric Radar:** Analyzes transcribed speech speed (words-per-minute), flags filler words ("um", "like", "basically"), and checks whether the candidate quoted tangible business metrics.
* **Milestone Deliverable:** Automated 5-track mock interview rounds (Support Lead, Data Analyst, Python Ops, Incident Triage, Conflict Leadership) with real-time AI speech critiques.

---

### Phase 3 (Days 31–60): Smart Sourcing & Clipboard Co-Pilot (v1.2 – v1.3)
* **Core Focus:** Slashing the time to apply from 15 minutes down to 60 seconds with zero browser extension friction.
* **Key Bot Capabilities:**
  * **Global Clipboard Watcher:** Runs in the Windows system tray. When the candidate copies any job description (from Chrome, Edge, LinkedIn, or email), the bot triggers a native Windows notification: *"Job Description detected on clipboard. Click to analyze in Aura."*
  * **1-Click Instant Triage:** With a single hotkey (`Ctrl+Shift+A`), the bot extracts the job title, company, calculates the ATS match score, and prepares 3 tailored STAR bullets in the background.
  * **48-Hour Recruiter Cadence Bot:** Monitors the local SQLite tracker daily. If an application has had no response for 48 hours, the bot automatically drafts a personalized polite follow-up InMail.
* **Milestone Deliverable:** Fully automated clipboard-to-CV pipeline operating across any browser with zero manual copy-pasting.

---

### Phase 4 (Days 61–90): Semi-Autonomous Job Agent & Multi-Agent Network (v2.0)
* **Core Focus:** Turning Aura into a background agent that works for the candidate even when they are offline.
* **Key Bot Capabilities:**
  * **Background Feed Sourcing:** Scans open job RSS feeds and whitelisted corporate career boards matching candidate filters (e.g. Remote/Hybrid, ₹18–28 LPA, Lead Support / Data Analyst) and ranks them by ATS fit score overnight.
  * **Smart Form-Fill Assistant:** Guides the candidate through tedious multi-page ATS portals (Workday, Taleo, Greenhouse) by providing 1-click clipboard answers for custom screening questions.
  * **Multi-Agent Specialist Swarm:**
    1. *Sourcing Agent:* Discovers and filters target roles.
    2. *Resume Architect Agent:* Tailors bullets to maximize ATS penetration.
    3. *Examiner Agent:* Conducts technical grillings on candidate's real projects (Trading Bot, Compliance Portal, LogiTrack).
    4. *Offer Negotiation Agent:* Analyzes job offers, compensation breakdowns (base vs bonus vs RSUs), and drafts counter-offer emails.
* **Milestone Deliverable:** A complete autonomous job search pipeline managing sourcing, tailoring, interview prep, and salary negotiation.

---

## 9. Technical Portfolio Showcase Timeline (Candidate Narrative)

To ensure the candidate's core projects (including the Algorithmic Trading Bot & GRC Compliance MVP) are highlighted effectively in interviews, the bot is pre-loaded with deep technical narratives:

| Milestone Week | Portfolio Asset Built & Integrated | Bot Interview Prep Focus |
|---|---|---|
| **Week 1** | **Sovereign Ledger GRC Compliance Portal** | Audit gap analysis, statutory workflow automation (Companies Act, GST), role-based access control. |
| **Week 2** | **LogiTrack Fleet Telemetry ERP** | Real-time SLA breach alerts, consignment tracking, event escalation pipelines. |
| **Week 3** | **Algorithmic Trading Bot & Pipeline** | High-throughput 24/7 runtime, WebSocket heartbeat daemons, pre-market historical data pre-fetching (9:10 AM startup sequence), and pytest data-validation suites. |
| **Week 4** | **Executive Cross-Disciplinary Synthesis** | Demonstrating how production application support bridges the gap between infrastructure, database states, and executive business KPIs. |

---
*End of Project Vision and Objectives Document — Version 0.0 & 1.0*
