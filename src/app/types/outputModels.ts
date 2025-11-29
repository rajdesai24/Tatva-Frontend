// src/app/types/outputModels.ts

export interface Claim {
  id: string;
  text: string;
  type: string;
  time_refs: string[];
  prominence: number;
  named_entities: string[];
  verdict: Verdict;
  evidence_strength: number;
}

export interface Verdict {
  gaps: string[];
  label: string;
  citations: any[];
  truth_prob: number;
  explanation: string;
  truth_prob_cal: number;
  modalities_check: {
    notes: string;
    ooc_risk: boolean;
  };
}

export interface RealityDistance {
  notes: string;
  value: number;
  status: string;
}

export interface Scores {
  tattva_score: number;
  reality_distance: RealityDistance;
}

export interface BiasContext {
  notes: string;
  rhetoric: string[];
  bias_signals: string[];
  missing_context: string[];
}

export interface TattvaOutput {
  id: string;
  created_at: string;
  logs: {
    status: string;
    message: string;
  };
  clerk_user_id: string;
  claims: Claim[];
  scores: Scores;
  bias_context: BiasContext;
  summary: string;
  status: string;
}