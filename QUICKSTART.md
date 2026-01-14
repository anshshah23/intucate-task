# Quick Start Guide - Intucate SQI Project

## ✅ Setup Complete!

Your Intucate Diagnostic Agent to Summary Customizer Agent Flow is ready to use.

## 🚀 Application is Running

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📋 Quick Test Workflow

### Step 1: Login
1. Open http://localhost:5173 in your browser
2. Enter email: `admin@intucate.com`
3. Enter password: `password123` (any 8+ char password works)
4. Click **Login**

### Step 2: Test with Sample Data
1. Navigate to the **Upload Student Data** section
2. Click **Choose File** and select: `sample-data/student_input.json`
   - OR copy/paste the JSON from the sample file
3. Click **Compute SQI**

### Step 3: View Results
The application will display:
- ✅ Overall SQI Score (0-100)
- ✅ Topic-level breakdown
- ✅ Concept-level scores  
- ✅ Ranked concepts with weights and reasons
- ✅ Complete JSON payload

### Step 4: Export Results
- Click **Download JSON** to save the payload
- Click **Copy JSON** to copy to clipboard

## 🧪 Run Tests

Open a new terminal and run:
```powershell
cd "c:\Users\ZBOOK\Desktop\Ansh Projects\intucate-task"
npm test
```

This runs the Jest test suite with comprehensive SQI engine tests.

## 📊 Sample Data Included

File: `sample-data/student_input.json`

Contains a realistic student attempt with:
- 6 questions across 2 topics
- Mix of correct/incorrect answers
- Various importance levels (A, B, C)
- Different difficulty levels (E, M, H)
- Practical and Theory questions
- Realistic time spent vs expected time

## 🔧 Development Commands

```powershell
# Start both frontend + backend
npm run dev

# Start only frontend
cd client
npm run dev

# Start only backend
cd server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📝 Key Features Implemented

### ✅ Must-Have Features
- [x] Login (Mocked) - Email validation (@intucate.com), 8+ char password
- [x] Admin Console - Diagnostic prompt management
- [x] Upload Data - File upload or paste JSON
- [x] Compute SQI - Full scoring engine with weights
- [x] Results Display - Overall, topic, and concept scores
- [x] Ranked Concepts - Weighted summary with reasons
- [x] JSON Export - Download and copy functionality

### ✅ Bonus Features
- [x] REST API - Express backend with TypeScript
- [x] Unit Tests - Comprehensive Jest test suite
- [x] "Why score?" - Detailed reasons for each concept ranking

### ✅ Tech Requirements
- [x] Frontend: React (Vite) + TypeScript
- [x] Backend: Node/Express + TypeScript
- [x] Single repo with organized structure
- [x] README with setup/run steps

## 🎯 SQI Scoring Formula Reference

**Per-Question:**
```
base = correct ? marks : -neg_marks
weighted = base × importance_w × difficulty_w × type_w
adjusted = apply_behavior_adjustments(weighted)
```

**Weights:**
- Importance: A=1.0, B=0.7, C=0.5
- Difficulty: E=0.5, M=1.0, H=1.4
- Type: Practical=1.1, Theory=1.0

**Behavior Adjustments:**
- Slow (>1.5× expected): ×0.9
- Very slow (>2× expected): ×0.8
- Marked review + wrong: ×0.9
- Revisited + correct: +0.2 marks bonus

**Overall SQI:**
```
raw_pct = (sum_weighted / max_possible) × 100
overall_sqi = clamp(raw_pct, 0, 100)
```

**Concept Ranking for Summary:**
- 40%: Wrong at least once
- 25%: Importance weight
- 20%: Reading/time proxy
- 15%: Diagnostic quality (1 - sqi/100)

## 📧 Next Steps

1. ✅ Test the login flow
2. ✅ Upload sample data and compute SQI
3. ✅ Review the ranked concepts output
4. ✅ Download/copy the JSON payload
5. ✅ Run the test suite
6. 📹 Record a 60-90 sec demo video showing:
   - Login
   - Data upload
   - SQI computation
   - Results review
   - JSON export

## 🎥 Demo Video Checklist

Your demo should show:
- [ ] Login with @intucate.com email
- [ ] Paste/save diagnostic prompt (optional)
- [ ] Upload student data (file or paste)
- [ ] Click Compute SQI
- [ ] Show overall SQI, topic scores, concept scores
- [ ] Show ranked concepts with weights
- [ ] Download JSON output
- [ ] (Bonus) Show Copy JSON feature

## 📦 Deliverables Checklist

- [x] GitHub repo link (ready to share)
- [x] README with setup/run steps
- [x] Working login flow
- [x] Diagnostic prompt management
- [x] Data upload (file + paste)
- [x] SQI computation engine
- [x] Results display
- [x] JSON export (download + copy)
- [x] Unit tests
- [x] Sample data included
- [ ] Demo video (60-90 sec) - **Record this!**
- [ ] Postman collection or /compute-sqi endpoint test

## 🌟 Project Highlights

1. **Full TypeScript Stack** - Type safety across frontend and backend
2. **Comprehensive SQI Engine** - Implements all formula requirements with behavior adjustments
3. **Smart Concept Ranking** - Multi-factor weighting for summary generation
4. **Test Coverage** - Jest tests for all scoring scenarios
5. **Developer Experience** - Hot reload, concurrent dev servers, clear project structure
6. **Production Ready** - Build scripts, error handling, validation

---

**🎉 Congratulations! Your Intucate SQI project is ready for submission!**

Remember to:
1. Record your demo video
2. Push to GitHub
3. Share repo link with team@intucate.com
4. Test the /api/compute-sqi endpoint (optional Postman collection)

Good luck! 🚀
