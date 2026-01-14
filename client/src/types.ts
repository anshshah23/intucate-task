export interface StudentAttempt {
  topic: string;
  concept: string;
  importance: 'A' | 'B' | 'C';
  difficulty: 'E' | 'M' | 'H';
  type: 'Practical' | 'Theory';
  case_based: boolean;
  correct: boolean;
  marks: number;
  neg_marks: number;
  expected_time_sec: number;
  time_spent_sec: number;
  marked_review: boolean;
  revisits: number;
}

export interface StudentData {
  student_id: string;
  attempts: StudentAttempt[];
}

export interface ConceptScore {
  topic: string;
  concept: string;
  sqi: number;
}

export interface RankedConcept {
  topic: string;
  concept: string;
  weight: number;
  reasons: string[];
}

export interface SummaryCustomizerOutput {
  student_id: string;
  overall_sqi: number;
  topic_scores: Array<{ topic: string; sqi: number }>;
  concept_scores: ConceptScore[];
  ranked_concepts_for_summary: RankedConcept[];
  metadata: {
    diagnostic_prompt_version: string;
    computed_at: string;
    engine: string;
  };
}
