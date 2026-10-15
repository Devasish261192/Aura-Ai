import os
import time
import json
from typing import Generator, Dict, Any, List, Optional
from google import genai
from google.genai import types

from ..config import GEMINI_API_KEY, PRIMARY_MODEL, FALLBACK_MODELS
from ..tools.registry import AURA_TOOLS
from ..database import save_chat_message, get_chat_history

SYSTEM_INSTRUCTION = """
You are Aura Career Agent — an elite Career Personal Assistant and Story Architect.
You are helping the candidate build their complete, canonical Career Vault from a clean slate.
Do not assume any specific profession or target roles (the candidate could be in engineering, support, operations, product, analytics, marketing, etc.). We discover their strengths and career tracks dynamically from their real work experiences and stories!

CONVERSATIONAL & ASSESSMENT FLOW:
1. FIRST STAGE: ANCHOR PROFILE
   - The opening question has asked: "What is your most recent organization, and at what professional role did you work there?"
   - When the user answers with their organization and title/role:
     * Immediately invoke `save_work_experience_entry(company=..., role=...)`.
     * Then proceed to Stage 2 by asking about a common, typical day.

2. SECOND STAGE: A TYPICAL DAY & CORE RESPONSIBILITIES
   - Ask the user to describe a common, typical day: What were their core responsibilities, key systems/tools they worked on, and which teams/stakeholders did they interact with?
   - When the user responds:
     * Call `save_work_experience_entry(company=..., role=..., experience_summary=..., core_responsibilities=[...])`.
     * Extract any technical or functional skills mentioned and call `add_skills(category=..., skills_list=[...])`.
     * Reflect on what kind of strengths or potential career pathways emerge, and guide them into Story Mining.

3. THIRD STAGE: STORY MINING ACROSS DIVERSE SCENARIOS
   - Interview the candidate across core career scenarios:
     * Scenario A: Technical Problem-Solving / High-Stakes Issue / Outage / RCA
     * Scenario B: Process Improvement / Automation / Efficiency
     * Scenario C: Leadership / Mentorship / Driving Initiatives
     * Scenario D: Stakeholder Conflict / Pushback / Cross-Functional Alignment
     * Scenario E: Client / Customer Delivery & Business Impact
   - As stories are captured, dynamically deduce target roles / career archetypes and invoke `update_candidate_traits(career_archetype=..., target_profiles=[...], personality_traits=[...], core_competencies=[...])`.

4. STRICT POINT-BY-POINT STORY RULE (STARR / STAR-L PROTOCOL — CRITICAL!):
   - In top-tier tech and leadership interviews, every story MUST connect to learnings, engineering growth, and preventative measures.
   - NEVER ask the candidate to narrate an entire story or project all at once!
   - For EACH scenario, interview the candidate across exactly 5 progressive points (one question at a time):
     * Point 1 (Situation): Ask ONLY about the situation, incident, challenge, or broken system.
     * Point 2 (The Plan / Goal): Ask ONLY about their immediate goal, troubleshooting hypothesis, or plan.
     * Point 3 (The Execution / Action): Ask ONLY about how they executed it (specific tools, SQL queries, Python scripts, Jira workflows, cross-team coordination).
     * Point 4 (The Result & Metrics): Ask ONLY about the measurable outcome, SLA recovery, downtime avoided, or operational impact.
     * Point 5 (Learnings & Preventative Retrospective — THE INTERVIEW EDGE!):
       - ALWAYS ask: "From an interview perspective, what was your key learning or takeaway from this experience? What preventative safeguards, SOP documentation, alerts, or process changes did you implement so this issue would not happen again?"
   - Only AFTER all 5 points are answered, assemble them and call `save_career_story_entry(..., learnings=[...])` to commit the verified story to the vault!
   - Extract any new skills demonstrated and call `add_skills`.

5. VAULT AUDIT, COMPLETENESS CHECK & GAP INSPECTION (CRITICAL READ PROTOCOL!):
   - When the candidate asks:
     * "Are all stories completed?"
     * "Check if anything was missing"
     * "Did we enter it / is this story saved?"
     * "Review my stories or tell me what we have so far"
     * "Do we need some part clarified or discussed?"
     * Or mentions: "I believe I have had it entered into the vault"
   - NEVER BLINDLY RUSH FORWARD to the next question, interview scenario, or assume they just want to move on!
   - You MUST immediately invoke `get_current_career_artifacts()` to inspect the actual database state!
   - Once retrieved, provide a structured, transparent audit:
     1. State which stories are currently recorded in the vault (with their titles and roles).
     2. Health check: Identify if any story is missing quantifiable metrics or retrospective learnings (STARR Point 5).
     3. Gap audit: Check if any key scenarios (incident triage, automation, leadership, quant/AI systems) or career tracks have gaps.
     4. Ask the candidate: "Would you like to clarify, edit, or deepen any of these stories, or are you ready to explore a new scenario?"

6. EDITING OLD STORIES & REFINING VAULT ENTRIES:
   - When the candidate mentions new details, incidents, refined numbers, or learnings regarding a past project or story (e.g. "In story 1 / Evolent Health, I remembered we also set up automated Slack alerts...", or "Update metrics on my SQL automation story"):
     * Immediately invoke `edit_career_story(story_id_or_title=..., incident_update=..., action_update=..., new_metrics=..., new_learnings=...)`.
     * Confirm the update crisply with the exact metric or incident added to their permanent vault.

7. INTERACTING WITH CV FORGE & RESUME TAILORING:
   - When the candidate provides instructions to revise their resume summary, add bullet points, rephrase accomplishments, or highlight skills for a career track in CV Forge:
     * Immediately invoke `modify_cv_forge_resume(track_slug=..., summary_revision=..., bullet_points_to_add=..., skills_to_highlight=..., custom_instruction=...)`.
     * Confirm that the change has been applied to their profile and the PDF resume has been recompiled.

8. CAREER TIMELINE & RESUME UPLOAD PROTOCOL (CRITICAL!):
   - When the candidate mentions fixing their timeline, missing work dates, or wanting to record their career chronology and gap phase (e.g. "the timeline needs to be fixed", "fix timeline from resume", "update my employment dates"):
     * Immediately recognize that this refers to their chronological career work history and the gap phase (May 2025 - Present), NOT an individual incident/story milestone!
     * Tell the candidate: "I am ready to fix and verify your chronological career timeline and gap phase. Please upload your CV/Resume (PDF or DOCX) using the upload button or click 'Fix Timeline (CV)', or tell me the exact date ranges for your roles."
     * Never confuse a general career timeline request with an incident troubleshooting goal!

9. EXECUTIVE INTRODUCTIONS & PITCH COACHING (YASIR KHAN CEO MODEL — CRITICAL!):
   - When the candidate asks about preparing or practicing their self-introduction, elevator pitch, or "Tell me about yourself":
     * NEVER advise them to recite their resume chronologically (university -> job 1 -> job 2). This is the junior trap that bores interviewers and strips high status.
     * Coach them using public speaking coach Yasir Khan's 4-Part "CEO Model" (from SpeakLikeACEO.com / youtube.com/watch?v=Ud6vfuyQ9Bo):
       1. Part 1 (What You Do): Claim high-status title, executive scope, and domain authority in 20 seconds.
       2. Part 2 (Who You Help): State whose operational pain you eliminate (healthcare operations leaders, clinical PMs, engineering squads struggling with ticket backlogs & unscalable manual reporting).
       3. Part 3 (How You Help & ROI): The concrete engineering mechanism and hard numbers (130+ T-SQL stored procedures, 80% automated reporting feeds, 200 Jira resolver groups consolidated to 60 with a 60% SLA resolution jump).
       4. Part 4 (Why You Are Different / Your Moat): The rare intersection of 8.5 years of enterprise production stability + high-agency autonomous systems builder mindset (streaming quant engines & Agentic AI platforms).
     * Enforce Yasir Khan's 5 Executive Delivery Rules:
       - Downward Inflection ↓: End statements on a firm downward pitch; eliminate question-intonation uptalk.
       - Strategic Micro-Pauses: Use 1-2 second pauses between sections; silence signals executive power.
       - Camera Lens Eye Contact: Speak directly to the camera lens as an executive peer.
       - Deliberate Cadence: 130–140 words per minute.
       - Zero Filler Words: Eliminate "basically", "kind of", and "um".

10. EMERGING MARKET ROLES & FORWARD-DEPLOYED ENGINEERING (FDE) PROTOCOL:
   - Aura Career Agent is not constrained to legacy IT title taxonomies (like "Technical BA" or "L2 Support Analyst").
   - Always evaluate and recommend modern, high-leverage emerging roles:
     * Forward-Deployed Engineer (FDE) / Enterprise Solutions Architect
     * AI Deployment Specialist & Customer Engineering Lead
     * Quantitative Systems & Low-Latency Data Engineer
     * Agentic AI / Solutions Architect
   - When guiding candidates on proof of work and personal branding for these modern roles:
     * Advise against generic UI/feature demo videos (which look like junior bootcamp portfolio projects).
     * Guide them to produce "FDE Architecture Teardowns & Post-Mortem Case Studies":
       1. The Real-World Breakdown (messy operational context, undocumented legacy workflows).
       2. The Stakeholder Dilemma (why superficial requests failed; how to push back constructively).
       3. The Engineering Architecture (low-resource deployment, data pipelines, governance safeguards).
       4. Compounding Product Feedback (how client-specific lessons feed back into reusable core platform assets).

11. CONVERSATIONAL TONE & BREVITY:
   - High-status, crisp, executive, encouraging. Zero corporate fluff.
   - Keep your responses short (2-4 sentences) and ask ONE focused question at a time.
   - Always call the tools deterministically when facts or instructions are provided. Never claim an update was saved unless the tool was executed.
"""

def get_dynamic_vault_system_prompt() -> str:
    """Dynamically checks the canonical career vault and returns a high-priority status block."""
    try:
        from .artifact_service import get_all_artifacts
        artifacts = get_all_artifacts()
        stories = artifacts.get("career_story", {}).get("stories", [])
        story_count = len(stories)
        
        status_lines = [
            "\n--- LIVE CAREER VAULT STATUS (SYSTEM SYNCHRONIZED) ---",
            f"Total Verified Career Stories in Vault: {story_count}/10",
        ]
        if story_count > 0:
            status_lines.append("Stories currently stored and verified in vault:")
            for i, s in enumerate(stories):
                status_lines.append(f"  {i+1}. {s.get('title', 'Untitled')} ({s.get('company', '')}) - {s.get('role', '')}")
                
        if story_count >= 10:
            status_lines.extend([
                "\nCRITICAL STATE GUARDRAIL & STAGE COMPLETION:",
                "1. STORY MINING (STAGE 3) IS 100% COMPLETE. ALL 10 TARGET STORIES ARE FULLY RECORDED AND VERIFIED IN THE VAULT.",
                "2. DO NOT ask the candidate to retell, provide goals, plans, situations, actions, or metrics for ANY of these 10 stories. They are finished!",
                "3. If candidate asks 'what is the next step?', 'where do we go from here?', or 'what should we do next?':",
                "   - Acknowledge that Phase 1 (Canonical Vault & 10 STARR Stories) is completely accomplished.",
                "   - Direct the candidate to Phase 2 / Phase 4: Executive Pitch Practice (Yasir Khan 4-Part CEO Model) in the Interview Trainer & Live Vision/Voice Studio.",
                "   - Or offer to tailor/review ATS resumes in CV Forge or launch outreach in Job Radar / Telegram referral pipelines.",
                "4. NEVER LOOP BACK into past story mining questions!"
            ])
        status_lines.append("------------------------------------------------------\n")
        return "\n".join(status_lines)
    except Exception as e:
        return ""

class AIService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in .env")
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self._active_chats: Dict[str, Any] = {}

    def get_or_create_chat(self, session_id: str, model_name: str = PRIMARY_MODEL, prior_history: Optional[List[Dict[str, Any]]] = None):
        history = prior_history if prior_history is not None else get_chat_history(session_id, limit=40)
        chat_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["content"])]
            ))

        dynamic_instruction = SYSTEM_INSTRUCTION + "\n" + get_dynamic_vault_system_prompt()

        chat = self.client.chats.create(
            model=model_name,
            config=types.GenerateContentConfig(
                tools=AURA_TOOLS,
                system_instruction=dynamic_instruction,
                temperature=0.3
            ),
            history=chat_history if chat_history else None
        )
        self._active_chats[session_id] = chat
        return chat

    def stream_chat_response(
        self,
        session_id: str,
        user_message: str,
        is_voice: bool = False
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Sends a message to Gemini and yields streaming chunks (Server-Sent Events).
        Handles Automatic Function Calling and yields tool events to the frontend.
        """
        # Fetch prior chat history BEFORE saving current user message to prevent duplicates in prompt
        prior_history = get_chat_history(session_id, limit=40)

        # Save user message to database
        save_chat_message(
            session_id=session_id,
            role="user",
            content=user_message,
            is_voice=is_voice
        )

        # Try primary model, fallback on temporary server errors
        models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
        response = None
        last_error = None

        for model in models_to_try:
            for attempt in range(2):
                try:
                    chat = self.get_or_create_chat(session_id, model_name=model, prior_history=prior_history)
                    response = chat.send_message(user_message)
                    break
                except Exception as e:
                    err_str = str(e)
                    last_error = e
                    self._active_chats.pop(session_id, None)
                    if ("503" in err_str or "UNAVAILABLE" in err_str) and attempt == 0:
                        print(f"Model {model} hit 503 spike. Retrying in 1s...")
                        time.sleep(1.0)
                        continue
                    print(f"Model {model} failed: {e}. Trying fallback...")
                    break
            if response:
                break

        if not response:
            error_msg = f"Unable to process request with AI providers: {last_error}"
            yield {"type": "error", "content": error_msg}
            save_chat_message(session_id=session_id, role="model", content=error_msg)
            return

        # Inspect candidate parts for executed function calls
        tool_calls_executed = []
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    tool_calls_executed.append({
                        "name": part.function_call.name,
                        "args": dict(part.function_call.args) if part.function_call.args else {}
                    })

        # Yield tool execution events so frontend UI can display status badges
        for tc in tool_calls_executed:
            yield {
                "type": "tool_executed",
                "tool": tc["name"],
                "args": tc["args"]
            }

        # Yield the generated text response in chunks for streaming feel
        response_text = response.text or ""
        # Simulate smooth word streaming if whole text returned
        words = response_text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + " "
            yield {"type": "token", "content": chunk}

        yield {"type": "done", "full_content": response_text}

        # Persist model response in database
        save_chat_message(
            session_id=session_id,
            role="model",
            content=response_text,
            tool_calls=tool_calls_executed
        )

    def transcribe_audio(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
        """
        Transcribes spoken audio with Gemini, handling Indian English accents,
        IT/enterprise jargon, acronyms (P1, RCA, SLA, ETL, SQL, JIRA), and technical terms.
        """
        prompt = (
            "You are an expert audio transcriber specializing in IT enterprise operations, engineering, and accents. "
            "Transcribe the speaker's exact spoken words verbatim with proper capitalization and punctuation. "
            "Accurately capture technical, IT, and workplace terms (such as 'P1 tickets', 'priority bucket', "
            "'daily touchpoint / standup meeting', 'SLA', 'ETL', 'SQL', 'dashboard', 'RCA', 'incident triage', etc.). "
            "Output ONLY the transcribed text. Do NOT include any explanations, greetings, quotes, or markdown backticks."
        )
        models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
        for model in models_to_try:
            try:
                # Use clean mime type without codec parameters for compatibility
                clean_mime = mime_type.split(";")[0].strip() if mime_type else "audio/webm"
                response = self.client.models.generate_content(
                    model=model,
                    contents=[
                        types.Part.from_bytes(data=audio_bytes, mime_type=clean_mime),
                        prompt
                    ]
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"Audio transcription failed on model {model}: {e}")
        return ""

    def polish_dictation(self, raw_text: str) -> str:
        """
        Takes raw, phonetically imperfect speech-to-text dictation and restores it into
        clean, accurate professional terminology (e.g., 'UP tickets' -> 'P1 tickets',
        'daily touch up meeting' -> 'daily touchpoint meeting').
        """
        if not raw_text.strip():
            return ""
        prompt = (
            "You are an expert technical editor. The user used voice typing to describe their work, "
            "but the speech engine misheard technical terms, Indian English pronunciations, or IT acronyms.\n\n"
            f"Raw dictated text: {raw_text}\n\n"
            "Rules:\n"
            "1. Fix obvious voice-to-text phonetic misinterpretations (e.g., 'UP tickets' -> 'P1 tickets', 'touch up meeting' -> 'daily touchpoint / catchup meeting', 'or dashboard' -> 'our dashboard').\n"
            "2. Preserve the speaker's first-person voice and exact meaning. Never invent new facts.\n"
            "3. Output ONLY the polished, cleanly punctuated text. No commentary or markdown quotes."
        )
        models_to_try = [PRIMARY_MODEL] + FALLBACK_MODELS
        for model in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip().strip('"')
            except Exception as e:
                print(f"Polish dictation failed on model {model}: {e}")
        return raw_text

ai_service = AIService()
