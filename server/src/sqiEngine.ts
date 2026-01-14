import { StudentAttempt, StudentData, SummaryCustomizerOutput, ConceptScore, RankedConcept } from './types.js';

interface QuestionScore {
  base: number;
  weighted: number;
  topic: string;
  concept: string;
  importance: string;
  difficulty: string;
  readingTimeProxy: number;
}

export class SQIEngine {
  // Weight mappings
  private static IMPORTANCE_WEIGHTS = { A: 1.0, B: 0.7, C: 0.5 };
  private static DIFFICULTY_WEIGHTS = { E: 0.5, M: 1.0, H: 1.4 };
  private static TYPE_WEIGHTS = { Practical: 1.1, Theory: 1.0 };

  /**
   * Calculate base score per question
   */
  private static calculateBaseScore(attempt: StudentAttempt): number {
    if (attempt.correct) {
      return attempt.marks;
    } else {
      return -attempt.neg_marks;
    }
  }

  /**
   * Calculate weighted score with importance, difficulty, and type weights
   */
  private static calculateWeightedScore(attempt: StudentAttempt, base: number): number {
    const importanceWeight = this.IMPORTANCE_WEIGHTS[attempt.importance];
    const difficultyWeight = this.DIFFICULTY_WEIGHTS[attempt.difficulty];
    const typeWeight = this.TYPE_WEIGHTS[attempt.type];
    
    return base * importanceWeight * difficultyWeight * typeWeight;
  }

  /**
   * Apply behavior adjustments based on time spent and review status
   */
  private static applyBehaviorAdjustments(attempt: StudentAttempt, weighted: number): number {
    let adjusted = weighted;

    // Slow solve (>1.5x expected time)
    if (attempt.time_spent_sec > attempt.expected_time_sec * 1.5) {
      adjusted *= 0.9;
    }

    // Very slow (>2x expected time)
    if (attempt.time_spent_sec > attempt.expected_time_sec * 2) {
      adjusted *= 0.8;
    }

    // Marked for review but wrong
    if (attempt.marked_review && !attempt.correct) {
      adjusted *= 0.9;
    }

    // Revisited and corrected
    if (attempt.revisits > 0 && attempt.correct) {
      adjusted += 0.2 * attempt.marks;
    }

    return adjusted;
  }

  /**
   * Calculate reading/time proxy for Summary Customizer Agent weights
   */
  private static calculateReadingTimeProxy(attempt: StudentAttempt): number {
    // Fast=1, normal=0.7, slow=0.4
    const ratio = attempt.time_spent_sec / attempt.expected_time_sec;
    if (ratio <= 1) return 1;
    if (ratio <= 1.5) return 0.7;
    return 0.4;
  }

  /**
   * Compute SQI for all attempts
   */
  public static computeSQI(studentData: StudentData, promptVersion: string = 'v1'): SummaryCustomizerOutput {
    const questionScores: QuestionScore[] = [];
    
    // Process each attempt
    for (const attempt of studentData.attempts) {
      const base = this.calculateBaseScore(attempt);
      const weighted = this.calculateWeightedScore(attempt, base);
      const adjusted = this.applyBehaviorAdjustments(attempt, weighted);
      const readingTimeProxy = this.calculateReadingTimeProxy(attempt);

      questionScores.push({
        base,
        weighted: adjusted,
        topic: attempt.topic,
        concept: attempt.concept,
        importance: attempt.importance,
        difficulty: attempt.difficulty,
        readingTimeProxy,
      });
    }

    // Calculate overall SQI
    const totalWeighted = questionScores.reduce((sum, q) => sum + q.weighted, 0);
    const maxPossible = studentData.attempts.reduce((sum, a) => {
      const maxBase = a.marks;
      const maxWeighted = this.calculateWeightedScore(a, maxBase);
      return sum + maxWeighted;
    }, 0);

    const rawPercentage = (totalWeighted / maxPossible) * 100;
    const overallSQI = Math.max(0, Math.min(100, rawPercentage));

    // Group by topic
    const topicMap = new Map<string, QuestionScore[]>();
    for (const score of questionScores) {
      if (!topicMap.has(score.topic)) {
        topicMap.set(score.topic, []);
      }
      topicMap.get(score.topic)!.push(score);
    }

    // Calculate topic scores
    const topicScores = Array.from(topicMap.entries()).map(([topic, scores]) => {
      const topicWeighted = scores.reduce((sum, s) => sum + s.weighted, 0);
      const topicAttempts = studentData.attempts.filter(a => a.topic === topic);
      const topicMax = topicAttempts.reduce((sum, a) => {
        const maxBase = a.marks;
        const maxWeighted = this.calculateWeightedScore(a, maxBase);
        return sum + maxWeighted;
      }, 0);
      const topicSQI = Math.max(0, Math.min(100, (topicWeighted / topicMax) * 100));
      return { topic, sqi: parseFloat(topicSQI.toFixed(1)) };
    });

    // Group by concept
    const conceptMap = new Map<string, QuestionScore[]>();
    for (const score of questionScores) {
      const key = `${score.topic}::${score.concept}`;
      if (!conceptMap.has(key)) {
        conceptMap.set(key, []);
      }
      conceptMap.get(key)!.push(score);
    }

    // Calculate concept scores
    const conceptScores: ConceptScore[] = Array.from(conceptMap.entries()).map(([key, scores]) => {
      const [topic, concept] = key.split('::');
      const conceptWeighted = scores.reduce((sum, s) => sum + s.weighted, 0);
      const conceptAttempts = studentData.attempts.filter(a => a.topic === topic && a.concept === concept);
      const conceptMax = conceptAttempts.reduce((sum, a) => {
        const maxBase = a.marks;
        const maxWeighted = this.calculateWeightedScore(a, maxBase);
        return sum + maxWeighted;
      }, 0);
      const conceptSQI = Math.max(0, Math.min(100, (conceptWeighted / conceptMax) * 100));
      return { topic, concept, sqi: parseFloat(conceptSQI.toFixed(2)) };
    });

    // Rank concepts for Summary Customizer Agent
    const rankedConcepts = this.rankConceptsForSummary(studentData, conceptScores, questionScores);

    return {
      student_id: studentData.student_id,
      overall_sqi: parseFloat(overallSQI.toFixed(1)),
      topic_scores: topicScores,
      concept_scores: conceptScores,
      ranked_concepts_for_summary: rankedConcepts,
      metadata: {
        diagnostic_prompt_version: promptVersion,
        computed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        engine: 'sqi-v0.1',
      },
    };
  }

  /**
   * Rank concepts for Summary Customizer Agent with weights
   * Criteria:
   * - 40%: wrong at least once (binary 1/0)
   * - 25%: importance weight (A=1, B=0.7, C=0.5)
   * - 20%: inverse reading/time proxy (fast=1, normal=0.7, slow=0.4)
   * - 15%: diagnostic quality (1 - concept_sqi/100)
   */
  private static rankConceptsForSummary(
    studentData: StudentData,
    conceptScores: ConceptScore[],
    questionScores: QuestionScore[]
  ): RankedConcept[] {
    const ranked: RankedConcept[] = [];

    for (const conceptScore of conceptScores) {
      const attempts = studentData.attempts.filter(
        a => a.topic === conceptScore.topic && a.concept === conceptScore.concept
      );
      const scores = questionScores.filter(
        q => q.topic === conceptScore.topic && q.concept === conceptScore.concept
      );

      // 40%: wrong at least once
      const wrongAtLeastOnce = attempts.some(a => !a.correct) ? 1 : 0;
      const wrongScore = wrongAtLeastOnce * 0.4;

      // 25%: importance weight
      const importanceWeights = attempts.map(a => this.IMPORTANCE_WEIGHTS[a.importance]);
      const avgImportance = importanceWeights.reduce((sum, w) => sum + w, 0) / importanceWeights.length;
      const importanceScore = avgImportance * 0.25;

      // 20%: inverse reading/time proxy
      const readingProxies = scores.map(s => s.readingTimeProxy);
      const avgReading = readingProxies.reduce((sum, p) => sum + p, 0) / readingProxies.length;
      const readingScore = avgReading * 0.2;

      // 15%: diagnostic quality (1 - concept_sqi/100)
      const diagnosticScore = (1 - conceptScore.sqi / 100) * 0.15;

      // Total weight
      const weight = wrongScore + importanceScore + readingScore + diagnosticScore;

      // Generate reasons
      const reasons = this.generateReasons(conceptScore, attempts, avgImportance, avgReading);

      ranked.push({
        topic: conceptScore.topic,
        concept: conceptScore.concept,
        weight: parseFloat(weight.toFixed(3)),
        reasons,
      });
    }

    // Sort by weight descending, normalize to 0-1
    ranked.sort((a, b) => b.weight - a.weight);
    const maxWeight = ranked[0]?.weight || 1;
    ranked.forEach(r => {
      r.weight = parseFloat((r.weight / maxWeight).toFixed(2));
    });

    return ranked;
  }

  /**
   * Generate human-readable reasons for concept ranking
   */
  private static generateReasons(
    conceptScore: ConceptScore,
    attempts: StudentAttempt[],
    avgImportance: number,
    avgReading: number
  ): string[] {
    const reasons: string[] = [];

    const wrongAtLeastOnce = attempts.some(a => !a.correct);
    if (wrongAtLeastOnce) {
      reasons.push('Wrong at least once');
    }

    if (avgImportance >= 0.9) {
      reasons.push('High importance (A)');
    } else if (avgImportance >= 0.6) {
      reasons.push('Medium importance (B)');
    } else {
      reasons.push('Low importance (C)');
    }

    if (conceptScore.sqi < 50) {
      reasons.push('Low diagnostic score');
    } else if (conceptScore.sqi < 75) {
      reasons.push('Medium diagnostic score');
    }

    if (avgReading >= 0.8) {
      reasons.push('Fast reading/response time');
    } else if (avgReading < 0.5) {
      reasons.push('Slow reading/response time');
    }

    return reasons;
  }
}
