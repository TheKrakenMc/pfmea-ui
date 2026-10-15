# PFMEA UI

Aplicación Vite + React + TypeScript para gestionar productos, diagramas, PFMEA y planes de control mediante pfmea-api.

## Desarrollo

    npm ci
    npm run dev

Configurar VITE_API_BASE_URL en .env.local con la URL de la API terminada en /api/v1. Para un ensayo exclusivamente sintético, usar http://localhost:8014/api/v1 e iniciar python -m scripts.audit_server desde el repositorio hermano; el navegador de auditoría utiliza el puerto 5174.

## Comportamiento

Login con contraseña y cookies HttpOnly; CSRF en escrituras. Selector de plantas autorizadas por el servidor. Los borradores se separan por usuario, planta y documento; la recuperación es explícita. Guardar en local no equivale a guardar en servidor. Los conflictos 409 conservan el borrador.

Los formularios y acciones se ajustan al rol y al estado documental. Las tablas PFMEA grandes renderizan sólo filas visibles, conservando el conjunto completo para guardar y exportar. Los planes enlazan controles con IDs estables de filas PFMEA y conservan las procedencias históricas.

## Calidad

    npm run typecheck
    npm run lint
    npm run test -- --run
    npm run build
    npm audit

Build incluye TypeScript. CI ejecuta tipos, lint, pruebas, build y auditoría de dependencias. Se conserva package-lock.json.

Con ambos repositorios disponibles, node scripts/verify-postgres.mjs ensaya migraciones y RLS sobre datos sintéticos. node scripts/audit-ui.mjs comprueba pantallas y rendimiento; node scripts/audit-flow.mjs verifica el flujo de aprobación a través del navegador y la API de ensayo. Estos scripts requieren la API sintética; no apuntan al entorno real.

La revisión normativa queda fuera de una prueba de software: la AP deriva provisionalmente de las reglas Python existentes. Véase la documentación de pfmea-api y el informe de implementación en la carpeta raíz del proyecto.
