# Arquitectura, SOLID y calidad

## Resultado de la verificación

La revisión confirma una base con buenas prácticas en Laravel y una arquitectura frontend inicial razonable. Sin embargo, no es correcto afirmar que toda la aplicación aplica SOLID de forma completa o que está terminada: Angular aún no integra los flujos protegidos del backend.

## SOLID en Laravel

### Responsabilidad única — Aplicado

La responsabilidad se distribuye por capa:

- Controladores: coordinación HTTP.
- Form Requests: validación de entrada.
- Policies: reglas de acceso.
- Resources: forma de la salida JSON.
- Modelos: relaciones y conversiones de datos.

Esta distribución está presente en `app/Http`, `app/Policies`, `app/Http/Resources` y `app/Models`. Por ejemplo, `JobController` no contiene reglas de validación y `StoreJobRequest` no escribe en la base de datos.

### Abierto/cerrado — Parcialmente aplicado

El enum `JobApplicationStatus` evita repartir textos de estado por el código. Agregar un estado implica ampliar el enum y ajustar la regla de validación, no cambiar todos los controladores.

No hay una necesidad actual de extensiones mediante herencia. Forzar patrones de herencia o repositorios genéricos en una aplicación de este tamaño aumentaría complejidad sin aportar valor.

### Sustitución de Liskov — No aplica de forma relevante

No hay jerarquías de clases de dominio personalizadas. Los modelos extienden las clases de Laravel siguiendo el contrato del framework, pero el proyecto no usa subtipos propios cuya sustitución deba comprobarse.

### Segregación de interfaces — Parcialmente aplicado

La API separa responsabilidades en clases pequeñas y Angular separa clientes por dominio (`AuthApi` y `JobApi`). No se han creado interfaces PHP artificiales porque no hay proveedores intercambiables, como servicios de pagos o correo externo.

Cuando aparezca una integración externa reemplazable, se debe introducir un contrato pequeño y una implementación ligada desde un provider.

### Inversión de dependencias — Aplicado en Angular; parcial en Laravel

Angular usa inyección de dependencias para `HttpClient`, `AuthApi`, `JobApi`, `AuthSession` y `API_URL`. Los componentes dependen de servicios inyectados, no de instancias construidas directamente.

Laravel usa inyección y resolución de dependencias del framework, aunque los controladores todavía trabajan directamente con Eloquent. Esto es correcto para el tamaño actual: un repositorio o service layer solo debe agregarse cuando exista lógica reutilizable y no como abstracción preventiva.

## Buenas prácticas verificadas

### Backend

- API versionada en `/api/v1`.
- Respuestas normalizadas con API Resources.
- Validación centralizada en Form Requests y uso de `validated()`.
- Autorización por rol y propiedad mediante Policies.
- Tokens de Sanctum para autenticación.
- Relaciones Eloquent tipadas, cargas anticipadas e índices para consultas frecuentes.
- Restricción única contra candidaturas duplicadas.
- Enum para estados de candidatura.
- Prevención de lazy loading en desarrollo.
- Pruebas de integración de los flujos principales.
- Formateo verificado con Laravel Pint.

### Frontend

- Componentes standalone.
- Carga diferida por ruta.
- Organización `core` / `features` / `shared`.
- Formularios reactivos y validadores.
- Estado local con Angular signals.
- Contratos TypeScript para datos de API.
- Guard de autenticación para rutas privadas.
- Estados de carga, error y vacío en la lista de vacantes.
- Estilos SCSS aislados por pantalla y diseño responsive.

## Brechas que deben corregirse

### Prioridad alta

1. **Gestión de candidaturas en Angular.** El candidato puede postularse y el reclutador puede consultar candidaturas por API, pero faltan paneles visuales para revisar estados y actualizarlos.
2. **Manejo global de errores HTTP.** El interceptor adjunta el token; falta centralizar la respuesta a 401, 403 y errores de red.

### Prioridad media

3. **Pruebas.** Hay cobertura de catálogo, publicación, aislamiento, postulaciones, formulario de reclutador y acciones de vacantes; faltan escenarios de login/logout y guardas.
4. **Configuración por entorno.** La URL de producción todavía es de ejemplo y debe reemplazarse por el endpoint real antes de desplegar.

## Conclusión

La solución aplica principios SOLID de manera pragmática: separa responsabilidades y usa inyección de dependencias sin introducir capas innecesarias. Laravel tiene una base más completa y validada. Angular cuenta con una estructura limpia y flujos de consulta, autenticación, postulación y gestión inicial de vacantes; aún requiere los incrementos indicados para completar el ciclo de candidaturas.
