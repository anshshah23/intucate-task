import { describe, expect, test } from '@jest/globals';
import { SQIEngine } from '../sqiEngine.js';
import { StudentData } from '../types.js';

describe('SQI Engine', () => {
  const sampleData: StudentData = {
    student_id: 'S123',
    attempts: [
      {
        topic: 'Borrowing Costs',
        concept: 'Definitions',
        importance: 'A',
        difficulty: 'M',
        type: 'Practical',
        case_based: false,
        correct: true,
        marks: 2,
        neg_marks: 0.5,
        expected_time_sec: 90,
        time_spent_sec: 110,
        marked_review: false,
        revisits: 1,
      },
      {
        topic: 'Borrowing Costs',
        concept: 'Definitions',
        importance: 'B',
        difficulty: 'H',
        type: 'Theory',
        case_based: false,
        correct: false,
        marks: 3,
        neg_marks: 1.0,
        expected_time_sec: 120,
        time_spent_sec: 150,
        marked_review: true,
        revisits: 0,
      },
    ],
  };

  test('computes overall SQI correctly', () => {
    const result = SQIEngine.computeSQI(sampleData);
    
    expect(result.student_id).toBe('S123');
    expect(result.overall_sqi).toBeGreaterThanOrEqual(0);
    expect(result.overall_sqi).toBeLessThanOrEqual(100);
  });

  test('returns topic scores', () => {
    const result = SQIEngine.computeSQI(sampleData);
    
    expect(result.topic_scores).toBeDefined();
    expect(result.topic_scores.length).toBeGreaterThan(0);
    expect(result.topic_scores[0]).toHaveProperty('topic');
    expect(result.topic_scores[0]).toHaveProperty('sqi');
  });

  test('returns concept scores', () => {
    const result = SQIEngine.computeSQI(sampleData);
    
    expect(result.concept_scores).toBeDefined();
    expect(result.concept_scores.length).toBeGreaterThan(0);
    expect(result.concept_scores[0]).toHaveProperty('topic');
    expect(result.concept_scores[0]).toHaveProperty('concept');
    expect(result.concept_scores[0]).toHaveProperty('sqi');
  });

  test('returns ranked concepts for summary', () => {
    const result = SQIEngine.computeSQI(sampleData);
    
    expect(result.ranked_concepts_for_summary).toBeDefined();
    expect(result.ranked_concepts_for_summary.length).toBeGreaterThan(0);
    expect(result.ranked_concepts_for_summary[0]).toHaveProperty('weight');
    expect(result.ranked_concepts_for_summary[0]).toHaveProperty('reasons');
    
    // Weights should be normalized to 0-1
    expect(result.ranked_concepts_for_summary[0].weight).toBeGreaterThanOrEqual(0);
    expect(result.ranked_concepts_for_summary[0].weight).toBeLessThanOrEqual(1);
  });

  test('includes metadata', () => {
    const result = SQIEngine.computeSQI(sampleData);
    
    expect(result.metadata).toBeDefined();
    expect(result.metadata.diagnostic_prompt_version).toBe('v1');
    expect(result.metadata.engine).toBe('sqi-v0.1');
    expect(result.metadata.computed_at).toBeDefined();
  });

  test('handles perfect score', () => {
    const perfectData: StudentData = {
      student_id: 'S456',
      attempts: [
        {
          topic: 'Test',
          concept: 'Perfect',
          importance: 'A',
          difficulty: 'E',
          type: 'Practical',
          case_based: false,
          correct: true,
          marks: 5,
          neg_marks: 0,
          expected_time_sec: 60,
          time_spent_sec: 50,
          marked_review: false,
          revisits: 0,
        },
      ],
    };

    const result = SQIEngine.computeSQI(perfectData);
    expect(result.overall_sqi).toBeGreaterThan(90);
  });

  test('handles all wrong answers', () => {
    const wrongData: StudentData = {
      student_id: 'S789',
      attempts: [
        {
          topic: 'Test',
          concept: 'Wrong',
          importance: 'C',
          difficulty: 'H',
          type: 'Theory',
          case_based: false,
          correct: false,
          marks: 2,
          neg_marks: 0.5,
          expected_time_sec: 100,
          time_spent_sec: 200,
          marked_review: true,
          revisits: 2,
        },
      ],
    };

    const result = SQIEngine.computeSQI(wrongData);
    expect(result.overall_sqi).toBeLessThan(50);
  });
});
