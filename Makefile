.PHONY: dev install

dev:
	cd backend && python -m uvicorn main:app --reload --port 8000

install:
	cd backend && pip install -r requirements.txt
