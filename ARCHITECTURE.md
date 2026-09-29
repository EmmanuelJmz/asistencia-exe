# Arquitectura de EduGestión

La aplicación es una SPA de React organizada como un monolito modular por función. Se despliega como un solo sitio web y utiliza Supabase como servicio de autenticación y base de datos.

## Mapa del código

- `src/app`: composición de la aplicación, sesión, navegación global y ciclo de carga.
- `src/application`: fachada de datos que usan la app y las funciones; punto de composición hacia infraestructura.
- `src/features`: pantallas y comportamiento específico de cada área escolar.
  - `auth`, `dashboard`, `groups`, `students`, `attendance`, `grades`, `reports`, `settings`.
  - `features/groups/model`: cálculos derivados de grupos, separados del componente de pantalla.
- `src/shared`: tipos compartidos y componentes reutilizados por varias áreas.
- `src/infrastructure`: integración con Supabase, almacenamiento de sesión, autenticación y repositorio de tablas.
- `src/features/groups/hooks` y `src/features/grades/hooks`: estado, formularios y acciones de sus pantallas principales.
- `src/features/groups/components` y `src/features/grades/components`: formularios modales separados de las pantallas.
- `src/main.tsx`: punto de entrada del navegador.
- `src/index.css`: estilos globales.

## Dirección de dependencias

```
main.tsx (composition root) -> app + adaptador Supabase
app -> features + application + shared
features -> application (puerto) + shared
adaptador Supabase -> application (puerto) + repositorios
repositorios -> Supabase
```

Las pantallas cargadas de forma diferida siguen siéndolo. Los nombres de pantalla y el flujo de datos se conservan.

## Convenciones para cambios nuevos

1. Coloca la interfaz y reglas propias dentro de `src/features/<área>`.
2. Mantén tipos reutilizados por varias áreas en `src/shared/types.ts`; tipos exclusivos deben vivir junto a su función.
3. Coloca componentes reutilizados en `src/shared/components`.
4. Mantén configuración y comunicación con Supabase dentro de `src/infrastructure`; una pantalla no debe crear clientes de Supabase.
5. Extrae cálculos sin interfaz a `model` dentro de su función y deja al componente presentar el resultado.
6. Evita crear microservicios o capas ceremoniales para CRUD sencillo. Separa casos de uso cuando representen una operación escolar con reglas o varios pasos.

## Estado de la migración

Las pantallas de grupos y calificaciones ya delegan estado y acciones a hooks propios; sus formularios modales están separados. El adaptador de autenticación y el repositorio Supabase también están aislados de la lógica de memoria escolar. `SchoolDataPort` ya define el contrato de aplicación, y `main.tsx` conecta ese contrato con la implementación actual de Supabase. Los módulos de dominio comparten una base de estado y forman una cadena temporal de compatibilidad para conservar todas las operaciones públicas durante la división. No son repositorios independientes todavía. El siguiente paso es sustituir esa cadena por composición explícita de servicios/repositorios; debe hacerse en etapas porque grupos, alumnos, asistencias y calificaciones comparten el estado en memoria y algunas operaciones tienen efectos en varias tablas.
