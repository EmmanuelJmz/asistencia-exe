# EduGestión Escolar (Web)

Aplicación web de control escolar construida con React, TypeScript y Vite. Supabase Auth y PostgreSQL son los servicios persistentes; no se requiere ni se incluye un runtime de escritorio.

## Desarrollo

1. Instala Node.js y npm.
2. Ejecuta `npm install`.
3. Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env.local`.
4. Ejecuta `npm run dev`.

Los datos escolares se consultan desde Supabase y se mantienen en memoria durante la sesión. El token de autenticación vive en `sessionStorage`; al cerrar sesión se elimina. Las preferencias temporales de navegación también se limitan a la pestaña.

## Producción

Despliega la aplicación estática de Vite en Vercel con las mismas variables públicas de entorno. La protección de acceso a tablas debe mantenerse en Supabase RLS; nunca coloques una clave `service_role` o secret en el frontend.
