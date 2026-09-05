@echo off
setlocal
cd /d "%~dp0"
set PORT=8765
where py >nul 2>nul
if %errorlevel%==0 (
  start "KC FUTURA" http://127.0.0.1:%PORT%/
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "KC FUTURA" http://127.0.0.1:%PORT%/
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)
echo Python wurde nicht gefunden. Die Startseite wird direkt geoeffnet.
start "KC FUTURA" index.html
