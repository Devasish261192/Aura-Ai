export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  isVoice?: boolean;
  createdAt: string;
}

export interface CareerStory {
  id: string;
  title: string;
  company: string;
  role: string;
  period?: string;
  domain?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  learnings?: string[];
  demonstrated_skills: string[];
  applicable_profiles: string[];
}

export interface CareerStoryArtifact {
  version: number;
  last_updated: string;
  candidate_name: string;
  stories: CareerStory[];
}

export interface TargetProfile {
  id: string;
  slug?: string;
  title: string;
  match_score: number;
  core_pitch: string;
}

export interface TraitsArtifact {
  version: number;
  last_updated: string;
  candidate_name: string;
  career_archetype: string;
  personality_traits: string[];
  core_competencies: string[];
  target_profiles: TargetProfile[];
}

export interface WorkHistoryItem {
  company: string;
  role: string;
  period?: string;
  location?: string;
  is_gap_phase?: boolean;
  summary?: string;
  responsibilities?: string[];
}

export interface ProfileMasterArtifact {
  version: number;
  last_updated: string;
  candidate: {
    name: string;
    headline: string;
    phone: string;
    email: string;
    location: string;
    linkedin: string;
    experience_summary: string;
  };
  work_history: WorkHistoryItem[];
  education: any[];
}

export interface MarketJob {
  title: string;
  company: string;
  location: string;
  job_url: string;
  match_score: number;
  why_fit: string;
  key_matching_qualities?: string[];
  date_posted?: string;
  is_applied?: boolean;
  salary?: string;
}

export interface TelegramReferral {
  message_id: number;
  job_title: string;
  company: string;
  requisition_code?: string;
  location: string;
  contact_person: string;
  match_score: number;
  why_fit: string;
  key_skills_matched?: string[];
  date_posted?: string;
  referral_pitch: string;
  telegram_link?: string;
  raw_text?: string;
}

export interface AuthUser {
  username: string;
  name: string;
  role_track: string;
  status?: 'OPEN' | 'ASSIGNED';
  is_assigned?: boolean;
  badge?: string;
  latest_role?: string;
  company?: string;
  color?: string;
}

export interface ArtifactsMap {
  career_story: CareerStoryArtifact;
  traits: TraitsArtifact;
  profile_master: ProfileMasterArtifact;
  skills_matrix: any;
}

