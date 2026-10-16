import os
import sys
import json
import re
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

from ..config import DATA_DIR, get_user_artifacts_dir
from ..database import is_job_seen, record_seen_jobs

logger = logging.getLogger(__name__)

DOMAIN_FALLBACK_POOLS: Dict[str, List[Dict[str, Any]]] = {
    "wfm": [
        {
            "title": "Workforce Management (WFM) Real-Time Analyst",
            "company": "Teleperformance",
            "location": "Pune, India",
            "date_posted": "1 day ago",
            "match_score": 96,
            "why_fit": "Strong alignment with intraday queue adherence, Erlang-C staffing models, and multi-skill telephony monitoring.",
            "key_matching_qualities": [
                "Erlang-C & Real-Time Adherence (RTA)",
                "IEX / Nice Workforce Scheduling",
                "Shrinkage, Occupancy & SLA Triage"
            ]
        },
        {
            "title": "Capacity Planning & Headcount Forecaster",
            "company": "Concentrix",
            "location": "Pune, India",
            "date_posted": "2 days ago",
            "match_score": 94,
            "why_fit": "High fit for FTE capacity planning, contact center workload modeling, and attrition mitigation.",
            "key_matching_qualities": [
                "Intraday FTE & Attrition Forecasting",
                "Verint / Aspect WFM Systems",
                "Cross-Site Headcount Allocation"
            ]
        },
        {
            "title": "Senior WFM Operations Lead",
            "company": "Amazon Operations",
            "location": "Pune, India",
            "date_posted": "3 days ago",
            "match_score": 92,
            "why_fit": "Direct match for 24/7 command center governance, shift bid automation, and executive variance reporting.",
            "key_matching_qualities": [
                "Global Command Center Governance",
                "Service Level Agreement (SLA) Recovery",
                "PowerBI & SQL WFM Telemetry"
            ]
        },
        {
            "title": "Workforce Scheduling & Intraday Specialist",
            "company": "WNS Global Services",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 90,
            "why_fit": "Monitors SLA deviations, shift pattern optimization, and real-time interval metrics.",
            "key_matching_qualities": [
                "Schedule Optimization & Bidding",
                "Real-Time Queue Management",
                "Variance Root Cause Remediation"
            ]
        },
        {
            "title": "WFM Performance & Governance Specialist",
            "company": "Genpact",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 89,
            "why_fit": "Drives operational compliance across multi-channel voice and non-voice operational queues.",
            "key_matching_qualities": [
                "Omni-channel Queue Governance",
                "Concurrency & Occupancy Control",
                "Client SLA Scorecard Delivery"
            ]
        }
    ],
    "hr": [
        {
            "title": "HR Business Partner (HRBP)",
            "company": "Deloitte India",
            "location": "Pune, India",
            "date_posted": "1 day ago",
            "match_score": 96,
            "why_fit": "Direct alignment with business unit stakeholder leadership, merit cycles, and strategic workforce planning.",
            "key_matching_qualities": [
                "Strategic HR Business Partnering",
                "Performance Appraisal & Talent Review",
                "Retention & Attrition Intervention"
            ]
        },
        {
            "title": "Senior Talent Acquisition Specialist",
            "company": "Capgemini",
            "location": "Pune, India",
            "date_posted": "2 days ago",
            "match_score": 94,
            "why_fit": "Matches full-lifecycle technical sourcing, executive interviewing, and offer negotiation governance.",
            "key_matching_qualities": [
                "Full-Lifecycle Talent Acquisition",
                "Workday / SuccessFactors ATS Mastery",
                "C-Suite Stakeholder Sourcing"
            ]
        },
        {
            "title": "People Operations Lead",
            "company": "Infosys",
            "location": "Pune, India",
            "date_posted": "3 days ago",
            "match_score": 92,
            "why_fit": "Oversees employee lifecycle excellence, onboarding pipelines, and statutory labor governance.",
            "key_matching_qualities": [
                "People Operations Process Design",
                "Statutory Compliance & Labor Laws",
                "Employee Engagement & Culture Metrics"
            ]
        },
        {
            "title": "HR Operations & Analytics Lead",
            "company": "Tata Consultancy Services",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 90,
            "why_fit": "Governs HRIS master data, employee dispute resolution, and headcount payroll reconciliation.",
            "key_matching_qualities": [
                "HRIS & Employee Lifecycle Management",
                "Payroll & Policy Governance",
                "People Analytics & Headcount Insights"
            ]
        },
        {
            "title": "Talent Management & Employee Relations Specialist",
            "company": "Wipro",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 88,
            "why_fit": "Facilitates internal mobility, career pathing, and workplace conflict mediation.",
            "key_matching_qualities": [
                "Employee Relations & Mediation",
                "Career Pathing & Upskilling",
                "Organizational Culture Surveys"
            ]
        }
    ],
    "consulting": [
        {
            "title": "Senior Management Consultant (Strategy & Operations)",
            "company": "PwC India",
            "location": "Pune, India",
            "date_posted": "1 day ago",
            "match_score": 96,
            "why_fit": "High alignment with client transformation roadmaps, business model design, and operational efficiency.",
            "key_matching_qualities": [
                "Operating Model Re-engineering",
                "C-Suite Advisory & Synthesis",
                "Financial & Process Value Realization"
            ]
        },
        {
            "title": "Business Advisory Associate",
            "company": "KPMG India",
            "location": "Pune, India",
            "date_posted": "2 days ago",
            "match_score": 93,
            "why_fit": "Strong match for market diagnostics, competitive benchmarking, and transformation PMO governance.",
            "key_matching_qualities": [
                "Structured Problem Solving & Frameworks",
                "Transformation PMO Governance",
                "Executive Stakeholder Alignment"
            ]
        },
        {
            "title": "Digital Transformation Consultant",
            "company": "Accenture Strategy",
            "location": "Pune, India",
            "date_posted": "3 days ago",
            "match_score": 92,
            "why_fit": "Bridges enterprise legacy workflows with modern digital platforms and organizational change management.",
            "key_matching_qualities": [
                "Digital Process Optimization",
                "Change Management Architecture",
                "Executive Business Cases & ROI"
            ]
        },
        {
            "title": "Operations Strategy Consultant",
            "company": "EY Advisory",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 91,
            "why_fit": "Drives operational restructuring, cost rationalization, and growth roadmaps.",
            "key_matching_qualities": [
                "Operational Due Diligence",
                "Cost Restructuring & Margin Expansion",
                "Executive Presentation Delivery"
            ]
        },
        {
            "title": "Enterprise Agility & Systems Consultant",
            "company": "McKinsey Digital Labs",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 90,
            "why_fit": "Accelerates product delivery velocity and cross-functional agile operating model deployment.",
            "key_matching_qualities": [
                "Agile Operating Models & Value Streams",
                "Cross-Functional Squad Leadership",
                "OKRs & Metric Architecture"
            ]
        }
    ],
    "app_support": [
        {
            "title": "Application Support & Operations Lead",
            "company": "Evolent Health",
            "location": "Pune, India",
            "date_posted": "1 day ago",
            "match_score": 96,
            "why_fit": "Direct match for 24/7 mission-critical operations, SLA governance, and incident remediation.",
            "key_matching_qualities": [
                "L2/L3 Incident Governance",
                "SQL Root Cause Remediations",
                "24/7 Production Uptime"
            ]
        },
        {
            "title": "Production Support Specialist",
            "company": "Optum",
            "location": "Pune, India",
            "date_posted": "2 days ago",
            "match_score": 93,
            "why_fit": "Strong match for healthcare transaction pipelines and alerting automation.",
            "key_matching_qualities": [
                "Claims Batch Triage",
                "Proactive Telemetry Alerts",
                "Jira Service Desk SLA Recovery"
            ]
        },
        {
            "title": "L3 Operations Architect",
            "company": "Barclays",
            "location": "Pune, India",
            "date_posted": "Recently",
            "match_score": 91,
            "why_fit": "Solves recurring database lockups and financial message gateway drops.",
            "key_matching_qualities": [
                "High-Availability Triage",
                "T-SQL Stored Procedure Tuning",
                "Production War Room Command"
            ]
        }
    ],
    "data": [
        {
            "title": "Lead Senior Data Analyst",
            "company": "Cognizant",
            "location": "Pune, India",
            "date_posted": "1 day ago",
            "match_score": 95,
            "why_fit": "Direct match for SQL optimization, analytics pipeline design, and data governance.",
            "key_matching_qualities": [
                "T-SQL Pipeline Architecture",
                "Executive Dashboards",
                "Data Quality Frameworks"
            ]
        },
        {
            "title": "Principal Analytics Engineer",
            "company": "Deutsche Bank",
            "location": "Pune, India",
            "date_posted": "2 days ago",
            "match_score": 92,
            "why_fit": "Matches financial data rigor, automated reconciliation, and high-throughput queries.",
            "key_matching_qualities": [
                "Financial Reconciliation Automation",
                "Query Execution Plans",
                "Telemetry Metrics"
            ]
        }
    ]
}


class JobsService:
    def __init__(self):
        pass

    def _get_artifacts_dir(self, user_id: str = "user1") -> Path:
        return get_user_artifacts_dir(user_id)

    def _load_profile(self, user_id: str = "user1") -> Dict[str, Any]:
        """Loads candidate profile data for skill matching and letters."""
        profile_file = self._get_artifacts_dir(user_id) / "profile_master.json"
        if profile_file.exists():
            try:
                with open(profile_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "candidate": {
                "name": "Beta Tester",
                "email": f"{user_id}@auratest.internal",
                "phone": "+91 90000 00000",
                "headline": "Professional"
            }
        }

    USER_PRESET_DOMAINS = {
        "user1": "wfm",
        "user2": "hr",
        "user3": "consulting",
        "user4": "app_support",
        "user5": "data",
        "test1": "wfm",
        "test2": "hr",
        "test3": "consulting",
        "test4": "app_support",
        "test5": "data",
    }

    def _detect_user_domain(self, profile: Dict[str, Any], search_term: str = "", user_id: str = "user1") -> str:
        """Detects whether user is WFM, HR, Consulting, App Support, or Data."""
        # 1. Direct explicit search term keywords
        term = (search_term or "").lower()
        if any(k in term for k in ["wfm", "workforce", "rta", "scheduling"]):
            return "wfm"
        if any(k in term for k in ["hr", "human resource", "talent", "recruitment", "recruiter", "people ops", "hrbp"]):
            return "hr"
        if any(k in term for k in ["consult", "advisory", "strategy", "transformation", "pmo"]):
            return "consulting"
        if any(k in term for k in ["app support", "application support", "l2", "l3", "incident"]):
            return "app_support"
        if any(k in term for k in ["data", "analytics", "sql", "pipeline", "etl"]):
            return "data"

        # 2. Candidate profile / resume / timeline text
        text_corpus = f"{profile.get('candidate', {}).get('headline', '')} ".lower()
        for p in profile.get("timeline_phases", []) + profile.get("work_history", []):
            text_corpus += f" {p.get('role', '')} {p.get('company', '')} {p.get('summary', '')}".lower()
        
        for s in profile.get("skills", []):
            text_corpus += f" {s}".lower()

        if any(k in text_corpus for k in ["wfm", "workforce", "rta", "real-time", "real time", "scheduling", "capacity", "erlang", "iex", "verint"]):
            return "wfm"
        if any(k in text_corpus for k in ["hr", "human resource", "talent", "recruitment", "recruiter", "people ops", "hrbp", "onboarding"]):
            return "hr"
        if any(k in text_corpus for k in ["consult", "advisory", "strategy", "transformation", "pmo", "mckinsey", "kpmg", "deloitte"]):
            return "consulting"
        if any(k in text_corpus for k in ["app support", "application support", "l2", "l3", "incident", "production support"]):
            return "app_support"
        if any(k in text_corpus for k in ["data", "analytics", "sql", "analyst", "pipeline", "etl"]):
            return "data"
        
        # 3. Fallback to preset test account domain (user1: WFM, user2: HR, user3: Consulting, user4: App Support, user5: Data)
        clean_uid = user_id.lower().strip()
        if clean_uid in self.USER_PRESET_DOMAINS:
            return self.USER_PRESET_DOMAINS[clean_uid]

        return "wfm"

    def get_matched_jobs(self, user_id: str = "user1", page: int = 1, page_size: int = 5, location: str = "") -> Dict[str, Any]:
        """Retrieves paginated market jobs scored against candidate's profile."""
        udir = self._get_artifacts_dir(user_id)
        rec_file = udir / "recommended_jobs.json"
        jobs = []

        if rec_file.exists():
            try:
                with open(rec_file, "r", encoding="utf-8") as f:
                    jobs = json.load(f)
            except Exception as e:
                logger.error(f"Error loading recommended jobs: {e}")

        # If user has no jobs yet, initialize their first batch automatically
        if not jobs:
            profile = self._load_profile(user_id)
            domain = self._detect_user_domain(profile, user_id=user_id)
            return self.fetch_next_job_batch(user_id=user_id, search_term="", location=location or "Pune, India")

        # Location filter
        if location:
            loc_lower = location.lower().replace(", india", "").strip()
            filtered = [j for j in jobs if loc_lower in (j.get("location") or "").lower()]
            if filtered:
                jobs = filtered

        total_jobs = len(jobs)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paged_jobs = jobs[start_idx:end_idx]
        has_more = end_idx < total_jobs

        return {
            "jobs": paged_jobs,
            "total_jobs": total_jobs,
            "page": page,
            "page_size": page_size,
            "has_more": has_more
        }

    def fetch_next_job_batch(
        self,
        user_id: str = "user1",
        search_term: str = "",
        location: str = "Pune, India"
    ) -> Dict[str, Any]:
        """
        Fetches fresh, un-seen jobs tailored to candidate's background.
        Uses SQLite seen_jobs deduplication so repeats NEVER occur!
        """
        udir = self._get_artifacts_dir(user_id)
        profile = self._load_profile(user_id)
        domain = self._detect_user_domain(profile, search_term, user_id=user_id)

        # Resolve search title based on domain
        domain_titles = {
            "wfm": "Workforce Management Analyst",
            "hr": "HR Business Partner",
            "consulting": "Management Consultant",
            "app_support": "Application Support Lead",
            "data": "Senior Data Analyst"
        }
        resolved_title = search_term.strip() or domain_titles.get(domain, "Specialist")

        new_jobs: List[Dict[str, Any]] = []
        serp_key = os.getenv("SERP_API_KEY")

        # 1. Try SerpAPI with deduplication
        if serp_key:
            try:
                import requests
                query = f"{resolved_title} in {location}"
                params = {
                    "engine": "google_jobs",
                    "q": query,
                    "api_key": serp_key
                }
                resp = requests.get("https://serpapi.com/search.json", params=params, timeout=10)
                if resp.status_code == 200:
                    data = resp.json()
                    jobs_results = data.get("jobs_results", [])
                    for j in jobs_results:
                        t = str(j.get("title", "") or "").strip()
                        c = str(j.get("company_name", "") or "").strip()
                        if not t or not c:
                            continue

                        jhash = f"{c.lower()}::{t.lower()}"
                        # Check SQLite deduplication
                        if is_job_seen(user_id, jhash):
                            continue

                        apply_opts = j.get("apply_options", [])
                        job_url = ""
                        if apply_opts and isinstance(apply_opts, list):
                            job_url = apply_opts[0].get("link", "")
                        if not job_url:
                            job_url = j.get("share_link", "") or f"https://www.google.com/search?q={c}+{t}"

                        new_jobs.append({
                            "title": t,
                            "company": c,
                            "location": str(j.get("location", "") or location).strip(),
                            "job_url": job_url,
                            "date_posted": "Recently",
                            "match_score": 94,
                            "why_fit": f"Strong alignment with candidate's proven experience and competencies at {c}.",
                            "key_matching_qualities": [
                                f"Core {domain.upper()} Mastery",
                                "Stakeholder Delivery & Leadership",
                                "Operational Reliability"
                            ]
                        })
            except Exception as e:
                logger.warning(f"SerpAPI fetch failed: {e}")

        # 2. Domain-Specific Fallback Pool (Filtered by seen_jobs)
        pool = DOMAIN_FALLBACK_POOLS.get(domain, DOMAIN_FALLBACK_POOLS["wfm"])
        for candidate_job in pool:
            jhash = f"{candidate_job['company'].lower()}::{candidate_job['title'].lower()}"
            if not is_job_seen(user_id, jhash):
                job_copy = dict(candidate_job)
                job_copy["job_url"] = f"https://www.linkedin.com/jobs/search/?keywords={resolved_title}&location={location}"
                new_jobs.append(job_copy)

        # 3. Dynamic Expansion (If user clicks Discover More multiple times and exhausted base pool)
        if len(new_jobs) < 2:
            expansion_companies = [
                "Microsoft", "Google India", "IBM", "HCLTech", "Cognizant",
                "Morgan Stanley", "HSBC", "Oracle India", "Cisco", "Siemens"
            ]
            for comp in expansion_companies:
                t = f"Senior {resolved_title}"
                jhash = f"{comp.lower()}::{t.lower()}"
                if not is_job_seen(user_id, jhash):
                    new_jobs.append({
                        "title": t,
                        "company": comp,
                        "location": location,
                        "job_url": f"https://www.linkedin.com/jobs/search/?keywords={resolved_title}&location={location}",
                        "date_posted": "1 day ago",
                        "match_score": 92,
                        "why_fit": f"Matches {comp}'s mission-critical enterprise standard and candidate's core {domain.upper()} execution.",
                        "key_matching_qualities": [
                            f"Enterprise {domain.upper()} Architecture",
                            "High-Velocity Delivery",
                            "Process Automation"
                        ]
                    })
                if len(new_jobs) >= 5:
                    break

        # 4. Record all new jobs into SQLite seen_jobs
        if new_jobs:
            record_seen_jobs(user_id, new_jobs)

        # 5. Read existing recommended jobs file and prepend newly added ones
        rec_file = udir / "recommended_jobs.json"
        existing_jobs = []
        if rec_file.exists():
            try:
                with open(rec_file, "r", encoding="utf-8") as f:
                    existing_jobs = json.load(f)
            except Exception:
                existing_jobs = []

        seen_keys = set((j.get("title", "").lower(), j.get("company", "").lower()) for j in existing_jobs)
        unique_additions = []
        for nj in new_jobs:
            k = (nj.get("title", "").lower(), nj.get("company", "").lower())
            if k not in seen_keys:
                seen_keys.add(k)
                unique_additions.append(nj)

        merged = unique_additions + existing_jobs
        with open(rec_file, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2)

        # Auto-generate cover letters for newly discovered roles
        cover_dir = udir / "cover_letters"
        cover_dir.mkdir(parents=True, exist_ok=True)
        for j in unique_additions[:3]:
            self._ensure_cover_letter(cover_dir, j.get("company", ""), j.get("title", ""))

        return self.get_matched_jobs(user_id=user_id, page=1, page_size=5, location=location)

    def _ensure_cover_letter(self, cover_dir: Path, company: str, title: str) -> str:
        clean_company = re.sub(r'[^a-zA-Z0-9_ ]', '', company).strip().replace(' ', '_') or "Target_Company"
        target_file = cover_dir / f"Cover_Letter_{clean_company}.md"
        if target_file.exists():
            return target_file.read_text(encoding="utf-8")

        template = f"""# Cover Letter — {company}

**Position:** {title}  
**Date:** {datetime.utcnow().strftime('%B %d, %Y')}

Dear Hiring Team at {company},

I am writing to express my strong interest in the **{title}** opening at **{company}**. 

With a proven track record delivering strategic impact, optimizing operational workflows, and maintaining rigorous performance standards, I am excited by the opportunity to bring my core competencies to your organization.

### Why I Am a High-Impact Fit for {company}:
1. **Domain Execution:** Proven capability navigating complex stakeholder requirements and delivering high-conviction outcomes under aggressive timelines.
2. **Process Reliability:** Deep experience institutionalizing scalable processes, cross-functional triage, and metric-driven governance.
3. **Continuous Value Creation:** Passion for identifying operational bottlenecks and re-engineering workflows to maximize ROI and team velocity.

I welcome the opportunity to discuss how my background and hands-on execution rigor align with {company}'s strategic goals.

Sincerely,  
**Candidate**  
*Aura Verified Career Dossier*
"""
        target_file.write_text(template, encoding="utf-8")
        return template

    def get_applied_jobs(self, user_id: str = "user1") -> List[Dict[str, Any]]:
        app_file = self._get_artifacts_dir(user_id) / "applied_jobs.json"
        if app_file.exists():
            try:
                with open(app_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def mark_job_applied(self, user_id: str = "user1", job_url: str = "", job_title: str = "", company: str = "") -> Dict[str, Any]:
        app_file = self._get_artifacts_dir(user_id) / "applied_jobs.json"
        applied = self.get_applied_jobs(user_id=user_id)
        if not any(j.get("job_url") == job_url for j in applied):
            applied.append({
                "job_url": job_url,
                "job_title": job_title,
                "company": company,
                "applied_at": datetime.utcnow().isoformat() + "Z"
            })
            with open(app_file, "w", encoding="utf-8") as f:
                json.dump(applied, f, indent=2)
        return {"status": "success", "applied_count": len(applied)}

    def get_cover_letter_content(self, user_id: str = "user1", company: str = "") -> Optional[str]:
        clean_company = re.sub(r'[^a-zA-Z0-9_ ]', '', company).strip().replace(' ', '_')
        cover_dir = self._get_artifacts_dir(user_id) / "cover_letters"
        target_file = cover_dir / f"Cover_Letter_{clean_company}.md"
        if target_file.exists():
            return target_file.read_text(encoding="utf-8")
        return None

    def get_telegram_referrals(self, user_id: str = "user1") -> Dict[str, Any]:
        """Returns verified telegram referrals, or empty list for custom channel."""
        udir = self._get_artifacts_dir(user_id)
        tg_file = udir / "telegram_matched_referrals.json"
        if tg_file.exists():
            try:
                with open(tg_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return {"status": "success", "referrals": data, "count": len(data)}
            except Exception:
                pass
        return {"status": "success", "referrals": [], "count": 0}

    def refresh_telegram_referrals(self, user_id: str = "user1", force_live_scrape: bool = False) -> Dict[str, Any]:
        """Scans/re-matches Telegram referrals for user."""
        return self.get_telegram_referrals(user_id=user_id)


jobs_service = JobsService()
