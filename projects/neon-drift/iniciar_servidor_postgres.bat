@echo off
title Neon Drift - Servidor PostgreSQL API
echo ========================================================
echo   Iniciando Servidor API de PostgreSQL para Neon Drift
echo   Base de Datos: neon_drift_db en PostgreSQL 17 (Puerto 5432)
echo ========================================================
cd /d "%~dp0server"
node server.js
pause
