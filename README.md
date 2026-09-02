# 🚀 Aplicación Electron Desktop (.EXE para Windows)

Este proyecto está configurado y preparado para convertirse en un ejecutable **.exe** para Windows (tanto instalador NSIS como versión portable) usando **Electron** y **electron-builder**.

---

## ⚡ Guía Rápida: Cómo generar tu `.exe` en 3 pasos

### Opción A (La más rápida con 1 clic en Windows):
1. **Descarga el ZIP del proyecto** desde el menú superior de AI Studio (**Settings > Export to ZIP**) o clona el repositorio.
2. Descomprime la carpeta en tu PC.
3. Haz doble clic en el archivo **`build-exe.bat`**. ¡Se encargará de instalar todo y crear tu `.exe` automáticamente!

---

### Opción B (Ejecutando los comandos en la Terminal / CMD / PowerShell):

Abre la terminal en la carpeta de este proyecto y ejecuta:

```bash
# 1. Instalar todas las dependencias (React, Vite, Electron, electron-builder)
npm install

# 2. Probar la aplicación en modo desarrollo de escritorio (Opcional)
npm run electron:dev

# 3. Compilar y generar los archivos .EXE para Windows
npm run dist:win
```

---

## 📁 ¿Dónde queda mi `.exe` generado?

Una vez termine el comando `npm run dist:win`, encontrarás tus archivos ejecutables en la carpeta:

```text
dist_electron/
 ├── Electron Desktop App Setup 1.0.0.exe   <-- Instalador estándar para Windows
 └── Electron Desktop App 1.0.0.exe         <-- Versión portable (funciona sin instalar)
```

---

## 🛠️ Comandos Disponibles

| Comando | Acción |
| :--- | :--- |
| `npm install` | Instala dependencias necesarias |
| `npm run dev` | Inicia el servidor de desarrollo web en http://localhost:3000 |
| `npm run electron:dev` | Ejecuta la app en una ventana nativa de Electron conectada a Vite |
| `npm run dist:win` | Genera tanto el instalador como la versión portable `.exe` |
| `npm run dist:portable` | Genera únicamente el `.exe` portable sin instalación |
| `npm run dist:nsis` | Genera únicamente el instalador `.exe` con asistente de instalación |
| `npm run build` | Compila los archivos web estáticos en `dist/` |

---

## 💻 Requisitos en tu ordenador
- **Node.js** v18 o superior instalado ([Descargar Node.js](https://nodejs.org/))
- **Windows 10 u 11** (para compilar y ejecutar el `.exe`)
