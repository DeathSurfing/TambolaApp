#!/usr/bin/env pwsh
# PowerShell script to start the FastAPI development server

Write-Host "🚀 Starting Bingo Game API Server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    python run.py
} catch {
    Write-Host "❌ Failed to start server. Make sure Python is installed and dependencies are available." -ForegroundColor Red
    Write-Host "Run 'pip install -r requirements.txt' to install dependencies." -ForegroundColor Yellow
}
