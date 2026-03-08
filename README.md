# 📜 LegacyCode Whisperer: AI-Powered Technical Debt Auditor

**LegacyCode Whisperer** is an AI-native agent designed to transform old, obscure, and undocumented code into modern, secure, and maintainable software. It leverages **Llama 3.3 70B (Groq)** for deep logical reasoning and **Supabase** for persistent audit history.

---

## 🚀 Key Features

- **Deep Logic Audit:** Uses Llama 3.3 70B via Groq to deconstruct complex, undocumented legacy logic.
- **Maintainability Scoring:** Combines LLM reasoning with static analysis (`Radon`) to provide a 0-100 health score.
- **Automated Refactor Roadmap:** Generates structured JSON plans to modernize syntax and fix security vulnerabilities.
- **Cloud Persistence:** Securely stores audit history and analysis reports using **Supabase (PostgreSQL)**.
- **Interactive Code Diff:** Side-by-side comparison of original code vs. AI-optimized versions.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Lucide React.
- **Backend:** FastAPI (Python 3.12).
- **AI Engine:** Llama 3.3 70B via Groq API (LangChain orchestration).
- **Database & Auth:** Supabase (PostgreSQL).
- **Static Analysis:** Radon (Cyclomatic Complexity metrics).

---

## 📂 Project Structure

```bash
├── backend/              # FastAPI API & AI Logic
│   ├── services/         # Groq LLM & Supabase integrations
│   ├── utils/            # Static analysis tools (Radon)
│   └── main.py           # API Endpoints
├── frontend/             # Next.js User Interface
└── supabase/             # Database migrations and schema

```

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
