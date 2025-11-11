@echo off
echo Starting Express Server and React App...

start "Express Server" cmd /k "cd ExpressServer && npm run dev"
timeout /t 3 /nobreak > nul
start "React App" cmd /k "cd ReactApp && npm run dev"

echo Both servers are starting...
echo Express Server: http://localhost:8000
echo React App: http://localhost:5173
pause