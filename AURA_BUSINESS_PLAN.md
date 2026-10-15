# Aura Career Engine — Strategic Business Plan & Operational Blueprint
**Confidential Business & Technical Architecture Plan**  
*Document Version: 1.0.0 | Date: October 2026 | Author: Devasish Bindani*

---

## 1. Executive Summary

### 1.1 Company & Product Vision
**Aura Career Engine** is the world’s first local-first, privacy-focused **Personal Career Operating System**. Designed for mid-to-senior technology, data, and operations professionals, Aura replaces the fragmented, anxiety-inducing job-search toolset with a unified desktop suite. It combines:
1. **Dynamic Resume Customization (CV Forge):** Instant ATS tailoring with native Microsoft Word (`.docx`) and pristine TrueType vector PDF exports.
2. **Behavioral & Technical Video Rehearsal (AI Interview Studio):** Real-time teleprompter, webcam recorder, and STAR framework drills.
3. **Structured Daily Pipeline Execution (30-Day Level-Up OS):** A gamified 5-step Standard Operating Procedure (SOP) backed by local SQLite.
4. **Living Career Memory Vault:** A permanent, secure repository of verified project narratives and metrics.
5. **Compliance-Safe Browser Companion:** A Chrome Side Panel that analyzes job descriptions via user-controlled capture without violating platform terms.

### 1.2 The Core Value Proposition
> *"Own your career narrative. Tailor applications in 90 seconds, rehearse high-stakes interviews with a live teleprompter, and manage your 90-day job acquisition sprint—100% privately on your desktop."*

### 1.3 Key Highlights & Financial Snapshot
* **Model:** Hybrid Desktop Software + Managed Cloud AI Gateway.
* **Hero Offering:** **₹4,999** for the 90-Day Job Acquisition Sprint Pass (Anchored against a ₹1,999/month decoy and ₹14,999 Lifetime Executive tier).
* **Launch Target:** **20 to 30 paying users per week** (₹4,00,000 to ₹5,00,000 monthly revenue).
* **Gross Margin:** **98.5%+** (Cloud hosting on Oracle Always Free ARM + ₹25/month average Gemini AI token cost per user).
* **Break-Even:** Immediate (Self-sustaining from Month 1).

---

## 2. Market Problem & Opportunity

### 2.1 The Problem Statement: Job Search Fragmentation & Burnout
Modern hiring is broken. Applicants face ATS filtering algorithms, ghosting, and brutal interview standards. To compete, candidates are forced to juggle **5 to 7 disconnected tools**:
1. **Resume Builders / Word / LaTeX:** Brittle formatting, broken margins, and ATS-incompatible tables.
2. **ChatGPT / Claude Tabs:** Context-blind prompt engineering that loses career history between chats.
3. **Jobscan / Resume Worded:** Expensive recurring subscriptions ($35/mo) just to check keyword percentages.
4. **Loom / Phone Cameras:** Unassisted mock recordings with zero feedback or pacing structure.
5. **Notion / Spreadsheets:** Manual, neglected application trackers with no daily routine integration.
6. **Data Privacy Vulnerabilities:** Web resume builders storing personal phone numbers, salary expectations, and work histories on third-party cloud servers.

### 2.2 Market Opportunity (TAM, SAM, SOM)
* **Total Addressable Market (TAM):** 65 Million knowledge workers and tech professionals globally seeking career mobility ($12 Billion global career-services market).
* **Serviceable Addressable Market (SAM):** 4.5 Million Indian IT, Data, and Operations professionals earning ₹10 LPA to ₹40 LPA who switch jobs every 2–3 years (₹2,250 Crore market).
* **Serviceable Obtainable Market (SOM - Years 1–2):** 2,500 active job seekers in India and remote corridors targeting senior support, data analytics, and software engineering roles (**₹1.25 Crore annual revenue**).

---

## 3. Product Architecture & Pillars

Aura's core architectural advantage is **"Client-Heavy, Cloud-Thin"**:
* 90% of heavy computation (video recording, Word COM generation, local database, UI rendering) runs **on the user's PC**.
* Only lightweight text prompts pass through the **Cloud AI Gateway**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER'S DESKTOP APP (Electron)                   │
│                                                                        │
│  [Heavy Compute - ₹0 Server Cost]                                      │
│  • Video & Audio capture (1080p webm/mp4)                              │
│  • Local video playback & storage                                      │
│  • MS Word COM Automation & TrueType PDF compiler                      │
│  • Local SQLite database (Job Tracker, Scorecards, Notes)              │
│  • Regex skill dictionary & preliminary ATS parsing                    │
│  • 60fps Electron UI rendering                                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                     Encrypted HTTPS (License JWT)
                     Only ~2KB of text per prompt
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        YOUR CLOUD AI GATEWAY                           │
│                     (OCI Ampere A1 ARM Cluster)                        │
│                                                                        │
│  • Validates user license & daily rate limit in Redis (<1ms)           │
│  • Injects Master Gemini Paid API Key (Kept 100% secret)               │
│  • Zero training / human review (Google Enterprise terms)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
                        Google Gemini 1.5/2.0 Flash
```

### 3.1 Pillar 1: CV Forge (Precision Resume Tailoring)
* Instant re-alignment of summary paragraphs, technical skills, and experience bullets against target JDs.
* Multi-track career branches (e.g., *Track 1: Application Support Lead*, *Track 2: Data & BI Analyst*, *Track 3: Python Operations*).
* Strict A4 print budget calculations with zero formatting breakage.
* Export to native Microsoft Word (`.docx`) and calibrated vector PDF via Word COM (`win32com.client`).

### 3.2 Pillar 2: AI Interview Studio & Teleprompter
* Integrated webcam monitor with customizable scrolling teleprompter.
* Pacing timers and real-time word-per-minute guides to eliminate camera shyness.
* 100% local video archive saved to disk (`/recordings`) with zero cloud bandwidth costs.

### 3.3 Pillar 3: Interview Trainer & Framework Drills
* Interactive drills enforcing **STAR** (Situation $\to$ Task $\to$ Action $\to$ Result), **CARL**, and **PREP** frameworks.
* Speech critique engine flagging filler words, weak passive phrasing, and missing business metrics.

### 3.4 Pillar 4: 30-Day Level-Up OS & Job Application Tracker
* Full Kanban & Table tracking in local SQLite (`job_search.db`).
* Disciplined 5-step daily SOP:
  1. *Scan & Filter* (15 min)
  2. *ATS Alignment Score* (15 min)
  3. *Tailor & Apply* (45 min)
  4. *Recruiter Outreach* (20 min)
  5. *Close Loop & Log* (10 min)
* Daily focus timer, XP gamification, and habit streaks.

### 3.5 Pillar 5: Compliance-Aware Browser Companion
* Chrome Manifest V3 Side Panel extension.
* Multi-mode capture adapter:
  * **User Selection (Universal Compliance):** Highlights text on screen without crawling pages.
  * **Quick Paste Drop Box:** Instant manual text input.
  * **Open ATS Direct Reader:** Safe page analysis for public company career sites (Greenhouse, Lever, Workday).
* Automatically enforces restricted mode on LinkedIn & Indeed to guarantee legal compliance.

---

## 4. Cloud Infrastructure & Technical Specifications

### 4.1 Server Infrastructure (Launch vs. Scale)

| Component | Launch Phase (80 – 500 Users/Mo) | Scale Phase (1 Million Users/Mo) |
|---|---|---|
| **Host Machine** | Oracle Cloud Always Free Ampere A1 (ARM64) | 4 × OCI Compute or Hetzner CPX31 Nodes |
| **vCPU & RAM** | 4 OCPUs, 24 GB RAM | 16 vCPUs, 32 GB RAM (Cluster) |
| **Operating System**| Ubuntu 24.04 LTS (aarch64) | Ubuntu 24.04 LTS |
| **Web Server** | Nginx Reverse Proxy + Let's Encrypt SSL | Cloudflare Pro + Nginx Cluster |
| **App Server** | Gunicorn + 4 Uvicorn Workers (FastAPI) | Auto-scaling FastAPI Docker swarm |
| **Cache & Auth** | Local Redis (Rate-limiting & Token Cache) | Managed Redis Cluster (4 GB) |
| **Database** | OCI Autonomous Database (ADB) or Local PG | Managed PostgreSQL Primary + Read Replica |
| **Monthly Hosting Bill**| **₹0 (Always Free)** | **~\$450 – \$750 / mo (~₹37k – ₹62k)** |

### 4.2 AI Token Unit Economics (Gemini 1.5 Flash)
* Input Rate: \$0.075 / 1M tokens | Output Rate: \$0.30 / 1M tokens.
* Average Monthly Usage per Active User: **2.4 Million Tokens**.
* **Direct AI Compute Cost per User per Month:** **\$0.29 (approx. ₹24 to ₹28)**.
* Even with 2x retry buffer: **₹50 / user / month maximum**.

---

## 5. Business Model & Pricing Strategy

### 5.1 The 3-Tier Offering Structure

```
  ┌──────────────────────┐     ┌────────────────────────┐     ┌──────────────────────┐
  │     MONTHLY PASS     │     │  90-DAY SPRINT PASS    │     │  EXECUTIVE LIFETIME  │
  │      (The Decoy)     │     │      (The Hero Offer)  │     │      (High-Ticket)   │
  │                      │     │                        │     │                      │
  │       ₹1,999         │     │         ₹4,999         │     │       ₹14,999        │
  │   Billed every 30d   │     │   One-Time (90 Days)   │     │   Permanent License  │
  └──────────────────────┘     └────────────────────────┘     └──────────────────────┘
```

#### Tier 1: Monthly Flexibility (₹1,999 / mo)
* Re-bills every 30 days.
* Includes CV Forge and 30-Day OS.
* Exists primarily as a psychological decoy to make the 90-Day Sprint Pass an obvious choice.

#### Tier 2: 90-Day Job Acquisition Sprint Pass (₹4,999 One-Time) — *Hero Offer*
* **Target:** Active job seekers wanting a full hiring cycle solution.
* **Includes:**
  * 90 Days of Unlimited Managed Cloud AI processing.
  * Full CV Forge (Word `.docx` & calibrated vector PDF exports).
  * 30-Day Level-Up OS & Job Application Tracker.
  * Interview Trainer (text-based STAR drills).
  * 1-Click Recruiter Outreach Note Generator.
  * Saves ₹1,000 compared to 3 months of subscription; zero recurring credit card hassles.

#### Tier 3: Executive Career OS (₹14,999 One-Time) — *Flagship Tier*
* **Target:** Mid-to-senior executives (₹20 LPA – ₹50 LPA+).
* **Includes:**
  * **Permanent Lifetime License** to Aura Desktop software.
  * **6 Months of Unlimited Managed Cloud AI processing** (with BYOK fallback forever).
  * **Full AI Interview Studio:** Webcam video recorder and live scrolling teleprompter.
  * **Multi-Track Switching:** 3 career tracks maintained simultaneously.
  * **Story & Artifacts Vault:** Permanent case-study storage.
  * **Aura Chrome Side Panel Companion.**

### 5.2 The Action-Gated Free Trial
* **No time limits (avoids procrastination).**
* Limited strictly by high-value actions:
  * 2 Resumes tailored to live JDs.
  * 1 Video Pitch take with teleprompter.
  * 1 Full STAR interview drill.
* **Conversion Paywall Trigger:** Prompts when the user attempts their 3rd resume or 2nd interview round, capitalizing on their immediate success.

---

## 6. Go-To-Market (GTM) & Customer Acquisition

### 6.1 Target Customer Profile (ICP)
* **Title:** Senior Analyst, Application Support Lead, Software Engineer, Data Engineer, Product/Project Manager.
* **Experience:** 3 to 12+ years.
* **Current Salary:** ₹8 LPA to ₹30 LPA.
* **Psychographics:** Frustrated by sending 50+ applications with zero response; experiences anxiety when speaking in interviews; values privacy and efficiency.

### 6.2 The Weekly Engine: Landing 25 Paying Users / Week
To hit **25 paid users/week (₹1,25,000/week)** at a 10% trial-to-paid conversion rate:
* Needs **250 trial downloads per week** (~35 downloads/day).
* Needs **1,000 landing page visitors per week** (~140 visitors/day at 25% download rate).

#### Growth Channel 1: The "Visual Contrast" Video Engine (LinkedIn)
* Post 45-second high-contrast screen recordings:
  * *"Watch Word margins break vs. Aura auto-formatting an executive CV in 60s."*
  * *"Why practicing in front of a mirror fails (and how a teleprompter fixes camera anxiety)."*
  * *"From 45% to 89% ATS score in 90 seconds without Canva."*

#### Growth Channel 2: The "Free ATS Gap Audit" Lead Magnet
* Post on LinkedIn and Reddit (`r/developersIndia`):
  * *"I built an ATS alignment scanner. Paste your target role and JD, and I’ll run a free gap report."*
  * Deliver the audit via DM with a link to download the trial.

#### Growth Channel 3: Tech Community Partnerships
* Seed Aura in targeted Telegram, WhatsApp, and Discord placement channels for Data Analysts, DevOps, and Healthcare Tech engineers.

---

## 7. Competitive Landscape & Defensibility

| Competitor Category | Key Players | Where They Fail | Aura's Unfair Advantage |
|---|---|---|---|
| **Online Web Resume Builders** | Canva, Novoresume, Zety | Static templates, broken Word export, monthly subscription traps, zero interview tools. | **Native Word COM & TrueType PDFs**, direct JD keyword injection, unified video studio. |
| **ATS Scanners & Trackers** | Jobscan, Teal, Huntr | Expensive ($35/mo), separate browser tabs, no interview practice, stores data in cloud. | **100% Local Desktop storage**, unified with CV generation and daily SOP routine. |
| **1-on-1 Mock Platforms** | Preplaced, Topmate, InterviewBit | Expensive (₹3,000 – ₹5,000/hr), hard to schedule, mirror anxiety. | **24/7 unlimited teleprompter rehearsal** with instant STAR framework feedback. |
| **Traditional Resume Writers** | TopCV, Naukri FastForward | ₹7,000 – ₹12,000 for 1 static resume; outdated within 14 days. | **Unlimited dynamic tailoring** for ₹4,999. |

---

## 8. Financial Projections (Year 1 to Year 3)

### 8.1 3-Year P&L Forecast (INR)

| Metric | Year 1 (Bootstrap) | Year 2 (Growth) | Year 3 (Scale) |
|---|:---:|:---:|:---:|
| **Average Paying Users / Month** | 100 users / mo | 450 users / mo | 1,800 users / mo |
| **Annual New Paid Users** | 1,200 | 5,400 | 21,600 |
| **Blended Avg. Order Value (AOV)**| ₹5,800 | ₹6,400 | ₹7,200 |
| **Gross Annual Revenue** | **₹69,60,000** | **₹3,45,60,000** | **₹15,55,20,000** |
| Payment Gateway Fees (2%) | ₹1,39,200 | ₹6,91,200 | ₹31,10,400 |
| Cloud Hosting & Servers | ₹12,000 | ₹1,80,000 | ₹7,50,000 |
| Gemini API Token Compute | ₹36,000 | ₹1,62,000 | ₹6,48,000 |
| Marketing & Creator Affiliates | ₹7,20,000 | ₹35,00,000 | ₹1,55,00,000 |
| Operational / Miscellaneous | ₹1,80,000 | ₹6,00,000 | ₹24,00,000 |
| **Total Operating Expenses (OpEx)**| **₹10,87,200** | **₹51,33,200** | **₹2,24,08,400** |
| **Net EBITDA / Pre-Tax Profit** | **₹58,72,800 (~₹58.7L)** | **₹2,94,26,800 (~₹2.94 Cr)** | **₹13,31,11,600 (~₹13.3 Cr)** |
| **EBITDA Margin** | **84.4%** | **85.1%** | **85.6%** |

---

## 9. Risk Matrix & Mitigation Strategies

| Identified Risk | Severity | Probability | Mitigation Strategy |
|---|:---:|:---:|---|
| **LinkedIn / Indeed Terms Compliance** | High | Low | Never scrape automated DOM loops. Enforce **user-controlled selection or quick paste** in the Chrome extension. |
| **AI Token Cost Escalation** | Low | Low | Keep prompts tightly scoped; cache system prompts; Gemini 1.5 Flash costs <₹25/mo per user. |
| **Desktop Piracy / Cracking** | Medium | Medium | Stateless license verification via cloud Redis gateway. AI features fail if license token is invalid. |
| **High User Churn** | Medium | High (in pure SaaS) | Neutralized by selling **₹4,999 90-Day Passes upfront** rather than relying on monthly recurring subscriptions. |

---

## 10. 30-Day Execution Roadmap & Bot Capability Timeline

### 10.1 Aura Bot Agentic Capability Timeline (90 Days)

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

* **Phase 1 (Days 1–15) — Deterministic Reactive Assistant (v1.0):**
  * Transactional state mutations (`set_key_skills`, `tailor_summary`, `replace_project_bullets`, `switch_track`) with zero hallucination.
  * Verified feedback loop: the bot only confirms once React state emits `200 OK`.
  * Real-time semantic ATS scanner (50–95% scoring) and gap detection.
  * 1-Click personalized recruiter InMail generation.
  * Text-based STAR behavioral answer evaluation.
* **Phase 2 (Days 16–30) — Proactive Accountability Coach & Live Mock Examiner (v1.1):**
  * Standup reminders: 9:00 AM daily routine kickoff and 6:00 PM scorecard focus review.
  * Dynamic mock interview follow-ups based on candidate speech transcripts.
  * Transcribed words-per-minute (WPM), speech cadence, and filler-word detection.
* **Phase 3 (Days 31–60) — Smart Sourcing & Clipboard Co-Pilot (v1.2–v1.3):**
  * System tray clipboard watcher: detects copied job descriptions and triggers instant triage without manual pasting.
  * Automated 48-hour follow-up cadence: identifies unanswered applications in SQLite and drafts follow-up notes.
  * 1-Click hotkey (`Ctrl+Shift+A`) application ingestion.
* **Phase 4 (Days 61–90) — Semi-Autonomous Job Agent & Multi-Agent Swarm (v2.0):**
  * Background job feed listener: scans and ranks incoming target jobs while candidate sleeps.
  * Multi-agent network: Sourcing Agent, Resume Architect Agent, Technical Interviewer Agent, and Offer Negotiation Agent.

---

### 10.2 30-Day Immediate Launch Roadmap

```
WEEK 1: CLOUD GATEWAY & INFRASTRUCTURE
• Provision OCI Ampere A1 ARM instance (4 OCPUs, 24 GB RAM, Ubuntu 24.04).
• Deploy FastAPI gateway with Nginx, Let's Encrypt SSL, and Redis token cache.
• Integrate Razorpay payment webhooks for instant license key generation.

WEEK 2: DESKTOP CLIENT PACKAGING & ACTION GATING
• Implement action-gated trial limits (2 resumes, 1 interview take) in desktop Electron build.
• Package installer (Windows .exe with electron-builder).
• Build minimal conversion paywall modal linked to Razorpay checkout.

WEEK 3: BETA TESTING & CONTENT SEEDING
• Onboard 10 beta users from target tracks (Application Support / Data Analysts).
• Record 3 visual contrast demo videos for LinkedIn.
• Publish "Free ATS Gap Audit" post on LinkedIn/Reddit.

WEEK 4: PUBLIC LAUNCH & SPRINT EXECUTION
• Launch official product page with ₹1,999/mo vs ₹4,999 90-Day Sprint pricing.
• Execute daily outreach to hit 250 trial downloads.
• Close first cohort of 20–30 paid customers (₹1,00,000 – ₹1,50,000 Week 1 revenue).
```

---
*End of Strategic Business Plan — Aura Career Engine*
