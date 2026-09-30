# Guía técnica: frontend Angular

## Objetivo

El frontend es una SPA (Single Page Application). Se ejecuta de forma independiente dentro de `frontend/`, consulta la API Laravel y cambia de pantalla sin recargar todo el navegador.

## Estructura de carpetas

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/                 # Infraestructura reutilizable para toda la SPA
│   │   │   ├── api/              # Clientes HTTP
│   │   │   ├── auth/             # Sesión y guardas de navegación
│   │   │   └── models/           # Interfaces TypeScript
│   │   ├── features/             # Módulos de negocio
│   │   │   ├── auth/pages/       # Login y registro
│   │   │   ├── dashboard/pages/  # Panel privado
	│   │   │   └── jobs/pages/       # Catálogo y gestión de vacantes
│   │   ├── shared/               # Elementos compartidos entre funcionalidades
│   │   ├── app.config.ts         # Proveedores globales
│   │   ├── app.routes.ts         # Rutas del navegador
│   │   └── app.ts                # Componente raíz
│   ├── styles.scss               # Estilos globales
│   └── main.ts                   # Inicio de Angular
├── angular.json                  # Configuración de compilación Angular
└── package.json                  # Dependencias y scripts npm
```

## Organización por funcionalidad

Las pantallas se agrupan por lo que hacen, no por el tipo de archivo. Por ejemplo, todo lo relacionado con autenticación está en `features/auth`. Así, cuando se agrega recuperación de contraseña, se ubica junto a login y registro, sin dispersar el código.

Cada página Angular está formada por tres archivos:

- `.ts`: estado, dependencias y comportamiento.
- `.html`: estructura semántica y enlaces de datos.
- `.scss`: estilos aislados de esa página.

## Core

### Modelos

`core/models/job.ts` contiene interfaces TypeScript para vacantes, usuarios autenticados y respuestas de API. TypeScript verifica estas estructuras durante la compilación y reduce errores por nombres de propiedades incorrectos.

### Clientes de API

- `JobApi` solicita `GET /jobs` y devuelve únicamente la colección de vacantes.
- `JobApplicationApi` consulta postulaciones y envía la postulación a una vacante.
- `AuthApi` encapsula registro, login y logout.

Los componentes no llaman directamente a `HttpClient`. Este aislamiento permite cambiar un endpoint, añadir pruebas o intercambiar el mecanismo HTTP sin reescribir cada pantalla.

La URL base se declara una vez mediante el token de inyección `API_URL` en `app.config.ts`.

### Sesión y guardas

`AuthSession` almacena token y usuario en `localStorage`, y expone `signals` computadas:

- `user`: usuario actual o `null`.
- `token`: token de Sanctum o `null`.
- `isAuthenticated`: indica si hay una sesión disponible.

`authGuard` protege `/dashboard`: si no existe sesión, Angular redirige a `/login`.

`authInterceptor` adjunta el token Bearer de Sanctum únicamente a solicitudes dirigidas a `API_URL`. Laravel sigue siendo quien valida la autorización efectiva.

## Rutas

| Ruta | Página | Propósito |
| --- | --- | --- |
| `/` | `JobList` | Muestra vacantes públicas. |
| `/login` | `Login` | Inicia sesión. |
| `/registro` | `Register` | Crea una cuenta. |
| `/dashboard` | `Dashboard` | Muestra el panel privado. |
| `/mis-vacantes` | `MyJobs` | Publicación y listado privado del reclutador. |

Las páginas se cargan bajo demanda con `loadComponent`. El navegador descarga el código de una pantalla cuando el usuario la visita, en lugar de descargar toda la aplicación de inicio.

## Pantallas actuales

### Lista de vacantes

`JobList` usa signals para vacantes, carga, errores, postulaciones existentes y envíos en curso. La plantilla muestra estados de carga/error/vacío y tarjetas con la descripción completa. Los candidatos autenticados pueden postularse; el catálogo carga sus postulaciones existentes. Los visitantes reciben un enlace a login y los reclutadores no ven una acción de postulación.

`SiteHeader` está montado desde el componente raíz. Muestra login/registro para visitantes y panel/logout para usuarios con sesión.

### Gestión del reclutador

`MyJobs` está protegida por `authGuard` y `recruiterGuard`. Carga solo las vacantes propias con `JobApi.listMine()`, muestra el estado y conteo de postulaciones y permite publicar y editar con validaciones equivalentes a Laravel. Al guardar, actualiza el listado. El borrado requiere confirmación y avisa que las postulaciones asociadas también se eliminarán por la regla de cascada. La API vuelve a validar rol y propiedad; la guarda Angular no sustituye la autorización del servidor.

### Login y registro

Ambas páginas utilizan formularios reactivos. Cada formulario:

1. declara controles y validadores;
2. no envía datos si el formulario es inválido;
3. muestra errores funcionales;
4. llama a `AuthApi`;
5. persiste la sesión con `AuthSession`;
6. navega al dashboard si la petición finaliza correctamente.

## Estilos

Se usa SCSS con estilos por página para mantener el alcance visual acotado. La lista de vacantes, formularios y dashboard incluyen diseño responsive para pantallas pequeñas.

## Limitaciones actuales

La aplicación ya cubre catálogo, registro/login/logout, postulación inicial y gestión de vacantes del reclutador. Aún faltan flujos de administración:

- No hay panel para que candidatos consulten estados ni para que reclutadores revisen y actualicen candidaturas.

Estas limitaciones son los siguientes incrementos recomendados.
