# Intucate Mini-Build: Diagnostic Agent to Summary Customizer Agent Flow

## Link to Demo: https://drive.google.com/file/d/1h3YZxxRkuB_CHsbB0dOWUxTVDejKPmul/view?usp=sharing

A full-stack application that computes Student Quality Index (SQI) from diagnostic test attempts and generates weighted concept rankings for a Summary Customizer Agent.

## 🎯 Features

### ✅ Authentication (Mocked)
- Email + password login
- Accepts any `*@intucate.com` email
- Password must be 8+ characters
- Session persisted in localStorage

### ✅ Admin Console
- **Diagnostic Prompt Management**: Save and persist diagnostic agent prompts
- **Data Upload**: Upload JSON files or paste JSON directly
- **SQI Computation**: Process student attempts and compute comprehensive quality metrics
- **Results Display**: 
  - Overall SQI score (0-100)
  - Topic-level breakdown
  - Concept-level scores
  - Ranked concepts with weights for summary generation
- **Export Options**: Download or copy JSON payload

### ✅ SQI Engine
The scoring engine implements a sophisticated multi-factor algorithm:

**Per-Question Scoring:**
```
base = correct ? marks : -neg_marks
weighted = base × importance_w × difficulty_w × type_w
```

**Weights:**
- Importance: A=1.0, B=0.7, C=0.5
- Difficulty: E=0.5, M=1.0, H=1.4
- Type: Practical=1.1, Theory=1.0

**Behavior Adjustments:**
- Slow solve (>1.5× expected): ×0.9
- Very slow (>2× expected): ×0.8
- Marked for review but wrong: ×0.9
- Revisited and corrected: +0.2 × marks

**Normalization:**
```
raw_pct = (sum_weighted / max_possible) × 100
overall_sqi = clamp(raw_pct, 0, 100)
```

### ✅ Summary Customizer Agent Weights
Concepts are ranked using:
- **40%**: Wrong at least once (binary)
- **25%**: Importance weight
- **20%**: Reading/time proxy (fast=1, normal=0.7, slow=0.4)
- **15%**: Diagnostic quality (1 - concept_sqi/100)

## 🏗️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- CSS3 with dark/light mode support

**Backend:**
- Node.js with Express
- TypeScript
- Jest for testing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Setup Steps

1. **Clone/Navigate to the repository:**
   ```bash
   cd "c:\Users\ZBOOK\Desktop\Ansh Projects\intucate-task"
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   This will install dependencies for:
   - Root project
   - Client (React frontend)
   - Server (Express backend)

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:5173`
- Backend API server on `http://localhost:3000`

### Separate Terminal Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## 🧪 Running Tests

```bash
npm test
```

This runs the Jest test suite for the SQI engine, including:
- Base score calculation
- Weight application
- Behavior adjustments
- Topic and concept aggregation
- Ranking algorithm
- Edge cases (perfect score, all wrong)

## 📖 Usage Guide

### 1. Login
- Navigate to `http://localhost:5173`
- Enter any email ending with `@intucate.com` (e.g., `admin@intucate.com`)
- Enter any password with 8+ characters
- Click **Login**

### 2. Save Diagnostic Prompt (Optional)
- Paste your diagnostic agent prompt in the textarea
- Click **Save Prompt** to persist it locally

### 3. Upload Student Data
**Option A - File Upload:**
- Click **Choose File** and select a JSON file
- See `sample-data/student_input.json` for format

**Option B - Direct Paste:**
- Paste JSON directly into the textarea

**Example Input Format:**
```json
{
  "student_id": "S123",
  "attempts": [
    {
      "topic": "Borrowing Costs",
      "concept": "Definitions",
      "importance": "A",
      "difficulty": "M",
      "type": "Practical",
      "case_based": false,
      "correct": true,
      "marks": 2,
      "neg_marks": 0.5,
      "expected_time_sec": 90,
      "time_spent_sec": 110,
      "marked_review": false,
      "revisits": 1
    }
  ]
}
```

### 4. Compute SQI
- Click **Compute SQI** button
- Results will display below with:
  - Overall SQI score
  - Topic scores
  - Concept scores
  - Ranked concepts with explanations
  - Full JSON payload

### 5. Export Results
- **Download JSON**: Saves as `summary_customizer_input_{student_id}.json`
- **Copy JSON**: Copies to clipboard for direct use

## 📊 Output Format

The system generates a JSON payload for the Summary Customizer Agent:

```json
{
  "student_id": "S123",
  "overall_sqi": 74.2,
  "topic_scores": [
    { "topic": "Borrowing Costs", "sqi": 71.5 }
  ],
  "concept_scores": [
    { "topic": "Borrowing Costs", "concept": "Definitions", "sqi": 62.3 }
  ],
  "ranked_concepts_for_summary": [
    {
      "topic": "Borrowing Costs",
      "concept": "Definitions",
      "weight": 0.83,
      "reasons": ["Wrong at least once", "High importance (A)", "Low diagnostic score"]
    }
  ],
  "metadata": {
    "diagnostic_prompt_version": "v1",
    "computed_at": "ISO-8601",
    "engine": "sqi-v0.1"
  }
}
```

## 🗂️ Project Structure

```
intucate-task/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   └── AdminConsole.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── types.ts
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── types.ts
│   │   ├── sqiEngine.ts   # Core SQI calculation logic
│   │   ├── index.ts       # Express server
│   │   └── tests/
│   │       └── sqiEngine.test.ts
│   ├── tsconfig.json
│   └── package.json
├── sample-data/
│   └── student_input.json # Sample test data
├── package.json           # Root package with scripts
└── README.md
```

## 🔧 API Endpoints

### `POST /api/prompt`
Save diagnostic prompt
```json
{ "prompt": "Your diagnostic prompt..." }
```

### `GET /api/prompt`
Retrieve saved prompt

### `POST /api/compute-sqi`
Compute SQI from student data
```json
{
  "student_id": "S123",
  "attempts": [...]
}
```

Returns: `SummaryCustomizerOutput` JSON

## 📝 Acceptance Criteria

✅ Login gates the Admin Console  
✅ Paste prompt → upload/paste data → click Compute SQI  
✅ Displays:
- Overall SQI (0–100)
- Topic & concept SQIs
- Ranked concept list with weights & reasons  

✅ JSON payload ready for Summary Customizer Agent  
✅ Include "Download" and "Copy JSON" buttons  

## 🎥 Demo

A demo video (60-90 seconds) showing:
1. Login flow
2. Saving diagnostic prompt
3. Uploading student data
4. Computing SQI
5. Viewing results
6. Downloading JSON output

## 🧑‍💻 Development Notes

### Environment Variables
No environment variables required - everything runs locally.

### Port Configuration
- Frontend: `5173` (Vite default)
- Backend: `3000`
- Proxy configured in Vite to forward `/api/*` to backend

### Data Persistence
- Diagnostic prompt: In-memory (server restart clears)
- Auth session: localStorage (client-side)
- For production: Consider adding database integration

## 📧 Contact

For questions or issues:
- Email: anshshah2303@gmail.com
- GitHub: https://github.com/anshshah23/intucate-task

## 📄 License

This project is part of the Intucate Mini-Build assessment.

---

**Built with ❤️ for Intucate**
