.PHONY: dev dev-frontend dev-all install

# Backend only
dev:
	cd backend && python -m uvicorn main:app --reload --port 8000

# Frontend only
dev-frontend:
	cd frontend && npm run dev

# Both together (requires bash)
dev-all:
	bash dev.sh

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
