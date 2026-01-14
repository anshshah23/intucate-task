import React, { useState, useEffect } from 'react';
import { StudentData, SummaryCustomizerOutput } from '../types';

interface AdminConsoleProps {
  onLogout: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onLogout }) => {
  const [diagnosticPrompt, setDiagnosticPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<SummaryCustomizerOutput | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const userEmail = localStorage.getItem('user_email') || 'Admin';

  useEffect(() => {
    // Load saved prompt on mount
    fetch('/api/prompt')
      .then((res) => res.json())
      .then((data) => {
        if (data.prompt) {
          setDiagnosticPrompt(data.prompt);
        }
      })
      .catch((err) => console.error('Error loading prompt:', err));
  }, []);

  const handleSavePrompt = async () => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: diagnosticPrompt }),
      });
      const data = await response.json();
      setSuccess('Prompt saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save prompt');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleComputeSQI = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Parse JSON input
      let studentData: StudentData;
      try {
        studentData = JSON.parse(jsonInput);
      } catch (err) {
        setError('Invalid JSON format. Please check your input.');
        setLoading(false);
        return;
      }

      // Call API
      const response = await fetch('/api/compute-sqi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compute SQI');
      }

      const resultData = await response.json();
      setResult(resultData);
      setSuccess('SQI computed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute SQI');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_customizer_input_${result.student_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    if (!result) return;

    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setSuccess('JSON copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="header">
        <div>
          <h1>Intucate SQI - Admin Console</h1>
          <p>Welcome, {userEmail}</p>
        </div>
        <button className="logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Diagnostic Prompt Section */}
      <div className="admin-section">
        <h2>Diagnostic Agent Prompt</h2>
        <textarea
          className="textarea-large"
          value={diagnosticPrompt}
          onChange={(e) => setDiagnosticPrompt(e.target.value)}
          placeholder="Paste your Diagnostic Agent prompt here..."
        />
        <div className="button-group">
          <button className="primary" onClick={handleSavePrompt}>
            Save Prompt
          </button>
        </div>
      </div>

      {/* Upload Data Section */}
      <div className="admin-section">
        <h2>Upload Student Data</h2>
        <p>Upload a JSON file or paste JSON directly below</p>
        <div className="file-upload">
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
          />
        </div>
        <div className="json-input-container">
          <textarea
            className="textarea-large"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={'{\n  "student_id": "S123",\n  "attempts": [\n    {\n      "topic": "...",\n      "concept": "...",\n      ...\n    }\n  ]\n}'}
          />
        </div>
        <div className="button-group">
          <button
            className="primary"
            onClick={handleComputeSQI}
            disabled={loading || !jsonInput}
          >
            {loading ? 'Computing...' : 'Compute SQI'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Results Section */}
      {result && (
        <div className="results-container">
          <h2>SQI Results</h2>

          <div className="metric">
            <span className="metric-label">Student ID:</span>
            <span className="metric-value">{result.student_id}</span>
          </div>

          <div className="metric">
            <span className="metric-label">Overall SQI:</span>
            <span className="metric-value">{result.overall_sqi}</span>
          </div>

          <h3>Topic Scores</h3>
          <div className="topic-scores">
            {result.topic_scores.map((topic, idx) => (
              <div key={idx} className="score-item">
                <span>{topic.topic}</span>
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {topic.sqi}
                </span>
              </div>
            ))}
          </div>

          <h3>Concept Scores</h3>
          <div className="concept-scores">
            {result.concept_scores.slice(0, 10).map((concept, idx) => (
              <div key={idx} className="score-item">
                <span>
                  {concept.topic} - {concept.concept}
                </span>
                <span style={{ color: '#646cff', fontWeight: 'bold' }}>
                  {concept.sqi}
                </span>
              </div>
            ))}
            {result.concept_scores.length > 10 && (
              <p style={{ marginTop: '0.5rem', color: '#888' }}>
                ... and {result.concept_scores.length - 10} more concepts
              </p>
            )}
          </div>

          <h3>Ranked Concepts for Summary Customizer Agent</h3>
          <div className="ranked-concepts">
            {result.ranked_concepts_for_summary.map((concept, idx) => (
              <div key={idx} className="concept-card">
                <div className="concept-header">
                  <div>
                    <strong>{concept.topic}</strong> - {concept.concept}
                  </div>
                  <div className="concept-weight">
                    Weight: {concept.weight}
                  </div>
                </div>
                <ul className="concept-reasons">
                  {concept.reasons.map((reason, ridx) => (
                    <li key={ridx}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3>JSON Payload for Summary Customizer Agent</h3>
          <div className="button-group">
            <button className="primary" onClick={handleDownloadJSON}>
              Download JSON
            </button>
            <button className="secondary" onClick={handleCopyJSON}>
              Copy JSON
            </button>
          </div>
          <div className="json-output">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
