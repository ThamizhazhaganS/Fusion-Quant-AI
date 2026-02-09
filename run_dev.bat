@echo off
echo Starting Backend and Frontend Servers...
start "Backend" cmd /k "cd backend && python -m uvicorn main:app --reload"
start "Frontend" cmd /k "cd frontend && npm run dev"
echo Servers started in new windows.
pause
