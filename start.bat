@echo off
echo Hotel Management System - Quick Start
echo =====================================
echo.

echo Checking .NET installation...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK not found. Please install .NET 9.0 SDK first.
    echo Download from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

echo .NET SDK found!
echo.

echo Building the application...
cd HotelManagementAPI
dotnet build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful!
echo.
echo IMPORTANT: Before running, make sure:
echo 1. MySQL server is running
echo 2. Run the Database/setup_database.sql script
echo 3. Update the connection string in appsettings.json if needed
echo.
echo Starting Hotel Management System...
echo The application will open at: https://localhost (port will be shown)
echo.

dotnet run