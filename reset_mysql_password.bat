@echo off
setlocal
echo =========================================================
echo      MySQL 8.0 Root Password Reset Tool
echo      Setting root password to: root123
echo =========================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Administrator privileges required!
    echo Please right-click 'reset_mysql_password.bat' and select 'Run as administrator'.
    echo.
    pause
    exit /b 1
)

echo [1/5] Stopping MySQL80 service...
net stop MySQL80 >nul 2>&1

echo [2/5] Creating password reset script...
echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123'; > "%TEMP%\reset_mysql_pass.sql"

echo [3/5] Starting MySQL to apply new password...
start "" /b "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%TEMP%\reset_mysql_pass.sql" --console >nul 2>&1

echo Waiting for password update to complete...
timeout /t 7 /nobreak >nul

echo [4/5] Stopping temporary MySQL process...
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 2 /nobreak >nul

del "%TEMP%\reset_mysql_pass.sql" >nul 2>&1

echo [5/5] Starting MySQL80 service...
net start MySQL80

echo.
echo =========================================================
echo   SUCCESS! Your MySQL root password is now: root123
echo =========================================================
echo.
pause
