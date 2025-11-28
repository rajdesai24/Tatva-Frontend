export enum VerdictLabel {
  TRUE = "true",
  MOSTLY_TRUE = "mostly_true",
  MIXED = "mixed",
  MOSTLY_FALSE = "mostly_false",
  FALSE = "false",
  UNVERIFIED = "unverified"
}

export enum ClaimType {
  FACT = "fact",
  PREDICTION = "prediction",
  OPINION_WITH_FACT_CORE = "opinion_with_fact_core"
}

export interface Citation {
  title: string;
  url: string;
  publisher: string;
  date?: string;
  quote?: string;
}

export interface ModalitiesCheck {
  ooc_risk: boolean;
  notes: string;
}

export interface QueryItem {
  query: string;
  evidence_type: string;
  time_window?: string;
}

export interface Verdict {
  label: VerdictLabel;
  truth_prob: number;
  truth_prob_cal: number;
  explanation: string;
  citations: Citation[];
  gaps: string[];
  modalities_check: ModalitiesCheck;
}

export interface Claim {
  id: string;
  text: string;
  type: ClaimType;
  prominence: number;
  time_refs: string[];
  named_entities: string[];
  query_plan: QueryItem[];
  verdict: Verdict;
  evidence_strength: number;
}

export interface RealityDistance {
  status: "ok" | "needs_user_input";
  value: number;
  notes: string;
}

export interface BiasContext {
  bias_signals: string[];
  rhetoric: string[];
  missing_context: string[];
  notes: string;
}

export interface TattvaOutput {
  summary: string;
  claims: Claim[];
  tattva_score: number;
  reality_distance: RealityDistance;
  bias_context: BiasContext;
  limitations: string[];
}
