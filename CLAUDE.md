# LegacyCode Whisperer — Claude Instructions

## Project Overview
AI-powered technical debt auditor. Users submit legacy code; the system returns structured JSON reports with maintainability scores, security risks, and refactoring plans.

## Tech Stack
- **Backend:** Python 3.12+, FastAPI, Uvicorn
- **AI Engine:** Gemini 1.5 Flash via `langchain-google-genai`
- **Static Analysis:** Radon (cyclomatic complexity)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Next.js 14, Tailwind CSS, Lucide React

## Project Structure
```
backend/
├── main.py                  # FastAPI app factory + router inclusion
├── requirements.txt
├── .env.example
├── core/
│   └── config.py            # Pydantic Settings — all env vars loaded here
├── api/
│   └── v1/
│       └── endpoints/
│           └── analysis.py  # POST /api/v1/analyze
├── schemas/
│   └── analysis.py          # AnalysisRequest / AnalysisResponse Pydantic models
├── services/
│   ├── gemini_service.py    # LangChain + Gemini orchestration
│   └── supabase_service.py  # Supabase CRUD (Phase 2)
├── utils/
│   └── static_analysis.py  # Radon wrapper → cyclomatic complexity metrics
└── prompts/
    └── audit_prompts.py     # System prompt constants
frontend/                    # Next.js 14 app (Phase 2)
supabase/                    # DB migrations (Phase 2)
```

## Coding Conventions
- **Python typing:** Always use `from __future__ import annotations` and full type hints.
- **SOLID:** Each service/utility has a single responsibility. No business logic in endpoints.
- **Pydantic v2:** Use `model_validator`, `field_validator` — not deprecated v1 syntax.
- **Async-first:** All FastAPI endpoints and service calls must be `async`.
- **Config via env:** Never hardcode secrets. Always read from `core/config.py → Settings`.
- **Error handling:** Raise `HTTPException` in endpoints; services raise domain-specific exceptions.
- **No print statements:** Use Python `logging` module.

## Environment Variables Required
```
GEMINI_API_KEY=        # Google AI Studio key
SUPABASE_URL=          # Supabase project URL
SUPABASE_KEY=          # Supabase anon/service key
```

## Development Commands
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Contracts (Phase 1)
### POST /api/v1/analyze
**Request:**
```json
{ "code": "<string>", "language": "python" }
```
**Response:**
```json
{
  "maintainability_score": 72,
  "complexity_report": {...},
  "security_risks": [...],
  "refactoring_suggestions": [...],
  "plain_english_summary": "..."
}
```

## Phases
- **Phase 1 (current):** Backend structure + `/analyze` endpoint with Gemini + Radon.
- **Phase 2:** Supabase persistence + audit history endpoints.
- **Phase 3:** Next.js frontend with Refactor Diff view.
