#!/usr/bin/env bash
# dev.sh — Start backend (FastAPI) and frontend (Next.js) in one terminal.
# Usage: bash dev.sh
# Press Ctrl+C once to stop both processes.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours ───────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RESET='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${CYAN}  LegacyCode Whisperer — dev server${RESET}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# ── Backend ───────────────────────────────────────────────────────────────────
echo -e "${GREEN}[backend]${RESET} Starting FastAPI on http://localhost:8000 ..."
(
  cd "$ROOT/backend"
  python -m uvicorn main:app --reload --port 8000
) &
BACKEND_PID=$!

# Brief pause so the backend log header appears before the frontend one
sleep 1

# ── Frontend ──────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[frontend]${RESET} Starting Next.js on http://localhost:3000 ..."
(
  cd "$ROOT/frontend"
  npm run dev
) &
FRONTEND_PID=$!

# ── Cleanup on Ctrl+C ─────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo -e "${CYAN}Stopping both servers...${RESET}"
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo -e "${CYAN}Done.${RESET}"
}

trap cleanup INT TERM

# Wait for both child processes
wait "$BACKEND_PID" "$FRONTEND_PID"
