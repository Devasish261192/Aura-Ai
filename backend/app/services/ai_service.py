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
You are Aura — a friendly, supportive Career Coach and Personal Assistant.
You help professionals from all fields (Sales, Marketing, HR, Operations, Finance, Healthcare, Customer Service, Teaching, Logistics, and Technology) build a winning profile, create a clean ATS-friendly resume, and find great jobs.

COMMUNICATION RULES (VERY IMPORTANT):
1. Use simple, friendly words (A1-A2 plain English). Never use complicated tech jargon, coding terms, or corporate buzzwords.
2. Keep your answers short: 2 to 3 sentences maximum.
3. Always ask only ONE simple question at a time.
4. Encourage the user warmly with positive, simple praise ("Great job!", "That sounds wonderful!", "Excellent!").
5. Automatically call the right tool whenever the user shares facts.

FIXED 5-STEP GUIDED JOURNEY (FOLLOW IN THIS EXACT ORDER):

STEP 1: CURRENT OR MOST RECENT JOB
- If the user hasn't shared their recent job yet, ask:
  "Hello! I am your career coach Aura. To get started, what is your current or most recent job title, and which company do you work for?"
- When they answer:
  * Call `save_work_experience_entry(company=..., role=..., period="Recent")`.
  * Say something encouraging in simple words.
  * Move to Step 2.

STEP 2: EARLIER JOBS & WORK HISTORY
- Ask:
  "Nice! Did you work at any other companies before this, or would you like to click 'Upload CV' to fill your timeline automatically?"
- When they list past companies or roles:
  * Call `save_work_experience_entry(company=..., role=..., period=...)` for each.
  * If they say this is their first job or they have no earlier roles, acknowledge it warmly.
  * Move to Step 3.

STEP 3: DAILY DUTIES & TOOLS YOU USE
- Ask:
  "What computer software, tools, or apps do you use every day in your work (for example: Excel, email, CRM, billing, specialized apps, or communication tools)?"
- When they answer:
  * Call `add_skills(category="tools_and_platforms", skills_list=[...])`.
  * Then ask: "What are your top 2 or 3 daily tasks that you do best?"
  * When they reply, call `save_work_experience_entry(company=..., role=..., experience_summary=...)` and `add_skills(category="core_skills", skills_list=[...])`.
  * Move to Step 4.

STEP 4: YOUR BEST WORK STORIES (3 SIMPLE QUESTIONS)
- Interview the user about a proud achievement or challenge they solved.
- Ask only 3 simple questions, one question at a time:
  * Question 1 (The Problem): "Can you tell me about a busy day, a tough problem, or an important task you had to handle at work?"
  * Question 2 (What You Did): "What exact steps did you take to solve or complete it?"
  * Question 3 (The Good Result): "What was the good result? How did it help your team, company, or customer?"
- When all 3 questions are answered:
  * Assemble the story and call `save_career_story_entry(title=..., company=..., role=..., situation=..., task=..., action=..., result=..., metrics=[...], demonstrated_skills=[...], applicable_profiles=["General"])`.
  * Call `update_candidate_traits(personality_traits=[...], core_competencies=[...])`.
  * Tell them: "I have saved your success story! Would you like to share one more win, or are you ready to see your ready resume and jobs?"

STEP 5: READY RESUME & JOB SEARCH
- When the user asks about their resume:
  * Call `modify_cv_forge_resume` if they want to edit anything.
  * Direct them to the **Resume Builder** tab to download their ready-to-use 1-page PDF/Word resume.
- When the user asks about jobs:
  * Ask: "Which job title would you like to search, and which city (or all over India)?"
  * Call `search_live_jobs_serp(role_or_title=..., location=...)`.
  * Remind them: "You can click on any job to view the posting, or click the Google Maps link to check where the company is located!"
- When the user provides a Job Description (JD):
  * Call `tailor_resume_to_job_description(job_description=...)` to score ATS match and tailor their resume.

AUDITING SAVED WORK:
- When the user asks: "What do you have saved so far?" or "Check my profile":
  * Call `get_current_career_artifacts()`.
  * Summarize in 3 bullet points in plain English: their jobs, their top skills, and their saved stories.
"""

def get_dynamic_vault_system_prompt(user_id: str = "user1") -> str:
    """Dynamically checks the canonical career vault and returns a high-priority status block."""
    try:
        from .artifact_service import get_all_artifacts
        artifacts = get_all_artifacts(user_id=user_id)
        stories = artifacts.get("career_story", {}).get("stories", [])
        story_count = len(stories)
        
        status_lines = [
            "\n--- LIVE USER PROFILE STATUS ---",
            f"Total Saved Work Stories: {story_count}",
        ]
        if story_count > 0:
            status_lines.append("Stories currently saved in profile:")
            for i, s in enumerate(stories):
                status_lines.append(f"  {i+1}. {s.get('title', 'Untitled')} ({s.get('company', '')}) - {s.get('role', '')}")
                
        if story_count >= 3:
            status_lines.extend([
                "\nSTATUS NOTE:",
                "The user already has good work stories saved. If they want to share more, welcome them warmly.",
                "If they ask what to do next, invite them to check their Resume Builder or click Find Jobs."
            ])
        status_lines.append("----------------------------------\n")
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

        dynamic_instruction = SYSTEM_INSTRUCTION + "\n" + get_dynamic_vault_system_prompt(session_id)

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
        # Set active user context for tools & artifacts
        from .artifact_service import set_active_user
        set_active_user(session_id)

        # Fetch prior chat history BEFORE saving current user message to prevent duplicates in prompt
        prior_history = get_chat_history(session_id, limit=40)

        # Save user message to database
        save_chat_message(
            session_id=session_id,
            role="user",
            content=user_message,
            is_voice=is_voice
        )

        # Try primary model, fallback on temporary server errors or quota exhaustion
        unique_models = []
        for m in [PRIMARY_MODEL] + FALLBACK_MODELS:
            if m not in unique_models:
                unique_models.append(m)

        accumulated_text = []
        tool_calls_executed = []
        executed_tool_names = set()
        stream_succeeded = False
        last_error = None

        for model in unique_models:
            for attempt in range(2):
                try:
                    chat = self.get_or_create_chat(session_id, model_name=model, prior_history=prior_history)
                    stream_iter = chat.send_message_stream(user_message)

                    for chunk in stream_iter:
                        # Check for tool/function calls in chunk candidates
                        if chunk.candidates:
                            for cand in chunk.candidates:
                                if cand.content and cand.content.parts:
                                    for part in cand.content.parts:
                                        if part.function_call:
                                            fc_name = part.function_call.name
                                            if fc_name not in executed_tool_names:
                                                executed_tool_names.add(fc_name)
                                                fc_args = dict(part.function_call.args) if part.function_call.args else {}
                                                tool_calls_executed.append({
                                                    "name": fc_name,
                                                    "args": fc_args
                                                })
                                                yield {
                                                    "type": "tool_executed",
                                                    "tool": fc_name,
                                                    "args": fc_args
                                                }

                        chunk_text = ""
                        try:
                            chunk_text = chunk.text or ""
                        except Exception:
                            pass

                        if chunk_text:
                            accumulated_text.append(chunk_text)
                            yield {"type": "token", "content": chunk_text}

                    stream_succeeded = True
                    break

                except Exception as e:
                    err_str = str(e)
                    last_error = e
                    self._active_chats.pop(session_id, None)
                    print(f"Model {model} (attempt {attempt+1}) error: {err_str[:120]}")
                    if ("503" in err_str or "UNAVAILABLE" in err_str) and attempt == 0:
                        print(f"Retrying {model} in 0.8s...")
                        time.sleep(0.8)
                        continue
                    break

            if stream_succeeded:
                break

        response_text = "".join(accumulated_text).strip()

        if not response_text and not tool_calls_executed:
            error_msg = f"Unable to process request with AI providers: {last_error}"
            yield {"type": "error", "content": error_msg}
            save_chat_message(session_id=session_id, role="model", content=error_msg)
            return

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
