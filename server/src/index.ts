import express, { Request, Response } from 'express';
import cors from 'cors';
import { SQIEngine } from './sqiEngine.js';
import { StudentData } from './types.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory storage for diagnostic prompt
let diagnosticPrompt = '';

// Save diagnostic prompt
app.post('/api/prompt', (req: Request, res: Response) => {
  const { prompt } = req.body;
  diagnosticPrompt = prompt;
  res.json({ success: true, message: 'Prompt saved successfully' });
});

// Get diagnostic prompt
app.get('/api/prompt', (req: Request, res: Response) => {
  res.json({ prompt: diagnosticPrompt });
});

// Compute SQI
app.post('/api/compute-sqi', (req: Request, res: Response) => {
  try {
    const studentData: StudentData = req.body;
    
    // Validate input
    if (!studentData.student_id || !studentData.attempts || !Array.isArray(studentData.attempts)) {
      return res.status(400).json({ 
        error: 'Invalid input. Expected { student_id, attempts: [...] }' 
      });
    }

    const result = SQIEngine.computeSQI(studentData, 'v1');
    res.json(result);
  } catch (error) {
    console.error('Error computing SQI:', error);
    res.status(500).json({ 
      error: 'Failed to compute SQI', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
