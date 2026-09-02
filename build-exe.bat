@echo off
title Compilador Electron a .EXE para Windows
echo ============================================================
echo   COMPILADOR AUTOMATICO ELECTRON A .EXE (WINDOWS)
echo ============================================================
echo.
echo Verificando Node.js y npm...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b
)

echo [1/3] Instalando dependencias necesarias (incluyendo Electron y electron-builder)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar las dependencias con npm install.
    pause
    exit /b
)

echo.
echo [2/3] Compilando la aplicacion web React con Vite...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la compilacion con Vite.
    pause
    exit /b
)

echo.
echo [3/3] Generando instalador y portable .EXE para Windows con electron-builder...
call npx electron-builder --win nsis portable
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al generar el ejecutable .exe.
    pause
    exit /b
)

echo.
echo ============================================================
echo   Â¡COMPILACION COMPLETADA CON EXITO!
echo ============================================================
echo Tu ejecutable .EXE y el instalador estan listos en la carpeta:
echo   --^> dist_electron/
echo.
echo Archivos generados:
echo   1. Electron Desktop App Setup 1.0.0.exe  (Instalador)
echo   2. Electron Desktop App 1.0.0.exe        (Version Portable)
echo ============================================================
pause
