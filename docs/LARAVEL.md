# Guía técnica: backend Laravel

## Objetivo

El backend es una API REST que administra identidades, vacantes y candidaturas. No renderiza la interfaz Angular: ofrece datos JSON bajo el prefijo `/api/v1`.

## Estructura de carpetas

```text
app/
├── Http/
│   ├── Controllers/Api/V1/    # Acciones HTTP de la API
│   ├── Requests/              # Validación y autorización de entrada
│   └── Resources/V1/          # Contratos de salida JSON
├── Models/                    # Entidades Eloquent y relaciones
├── Policies/                  # Reglas de permiso basadas en usuario y recurso
├── Providers/                 # Configuración de la aplicación
└── JobApplicationStatus.php   # Enum de estados de candidatura

database/
├── factories/                 # Datos deterministas/ficticios para pruebas
└── migrations/                # Historial versionado de la base de datos

routes/
└── api.php                    # Endpoints de la API v1

tests/Feature/                 # Pruebas de comportamiento HTTP
```

## Capas y responsabilidades

### Rutas

`routes/api.php` es el punto de entrada. Agrupa las rutas en `v1` para que cambios incompatibles futuros puedan publicarse como `/api/v2` sin romper clientes existentes.

Las rutas públicas permiten listar y consultar vacantes. Las demás usan el middleware `auth:sanctum`, que exige una identidad autenticada.

### Controladores

Los controladores de `app/Http/Controllers/Api/V1` coordinan una solicitud:

1. reciben datos ya validados;
2. ejecutan la autorización necesaria;
3. consultan o modifican modelos;
4. devuelven un recurso JSON y el código HTTP correcto.

- `AuthController`: registro, login y logout; emite tokens personales de Sanctum.
- `JobController`: listado público, detalle y CRUD de vacantes.
- `JobApplicationController`: creación, listado, detalle, cambio de estado y eliminación de candidaturas.

No contienen reglas de validación largas ni transforman el JSON manualmente. Esta separación hace que cada clase tenga una responsabilidad concreta.

### Form Requests

Los archivos de `app/Http/Requests` validan datos antes de que entre el controlador.

| Clase | Responsabilidad |
| --- | --- |
| `RegisterRequest` | Valida nombre, email único, contraseña confirmada, rol y titular profesional. |
| `LoginRequest` | Exige email y contraseña. |
| `StoreJobRequest` | Valida una vacante nueva y comprueba que el usuario pueda crearla. |
| `UpdateJobRequest` | Valida campos opcionales al editar una vacante. |
| `StoreJobApplicationRequest` | Valida la carta de presentación. |
| `UpdateJobApplicationStatusRequest` | Solo permite estados declarados en el enum. |

La aplicación usa `validated()` en vez de `all()`. Esto evita que campos no validados lleguen a la persistencia.

### Modelos y relaciones

| Modelo | Tabla | Relaciones |
| --- | --- | --- |
| `User` | `users` | Publica muchas vacantes y crea muchas candidaturas. |
| `Job` | `job_postings` | Pertenece a un reclutador y tiene muchas candidaturas. |
| `JobApplication` | `job_applications` | Pertenece a una vacante y a un candidato. |

Se usa `job_postings` en lugar de `jobs`: Laravel ya reserva `jobs` para la cola de tareas, por lo que este nombre previene una colisión técnica.

`JobApplicationStatus` es un enum PHP que centraliza los estados válidos: `submitted`, `reviewing`, `interview`, `rejected` y `accepted`. El cast del modelo convierte automáticamente el texto de la base de datos a dicho enum.

### Policies

Las políticas evitan que la autorización quede mezclada con consultas o formularios.

- `JobPolicy`: un reclutador puede crear vacantes; solo quien publicó una puede editarlas o eliminarlas.
- `JobApplicationPolicy`: un candidato puede postularse; el reclutador dueño de una vacante puede cambiar el estado de sus candidaturas; el candidato solo puede retirar una candidatura aún enviada.

### API Resources

`JobResource` y `JobApplicationResource` definen los campos de cada respuesta. Esto evita exponer accidentalmente columnas internas como contraseñas, tokens o datos que no necesita el cliente.

## Base de datos

Las migraciones crean las tablas de dominio y sus restricciones:

- Las claves foráneas enlazan vacantes, candidatos y reclutadores.
- Las eliminaciones en cascada eliminan dependencias al retirar un usuario o vacante.
- La combinación `job_id` + `candidate_id` es única: una persona no puede postularse dos veces a la misma vacante.
- Los índices optimizan los listados por estado, fecha y reclutador.

## Endpoints principales

| Método | URL | Acceso |
| --- | --- | --- |
| `GET` | `/api/v1/jobs` | Público |
| `GET` | `/api/v1/jobs/{job}` | Público |
| `POST` | `/api/v1/auth/register` | Público |
| `POST` | `/api/v1/auth/login` | Público |
| `POST` | `/api/v1/auth/logout` | Autenticado |
| `GET` | `/api/v1/my/jobs` | Reclutador autenticado: solo sus vacantes |
| `POST` | `/api/v1/jobs` | Reclutador |
| `PATCH` | `/api/v1/jobs/{job}` | Reclutador propietario |
| `DELETE` | `/api/v1/jobs/{job}` | Reclutador propietario |
| `POST` | `/api/v1/jobs/{job}/applications` | Candidato |
| `GET` | `/api/v1/applications` | Autenticado |
| `PATCH` | `/api/v1/applications/{application}` | Reclutador propietario |

Para rutas protegidas se debe enviar `Authorization: Bearer <token>`. El token se obtiene al iniciar sesión o registrarse.

## Flujo de una petición

```text
Cliente Angular
  → ruta API
  → middleware de autenticación (si aplica)
  → Form Request: validación/autorización
  → Controller: operación y Policy
  → Model/Eloquent: base de datos
  → API Resource
  → JSON al cliente
```

## Pruebas backend

Las pruebas de `tests/Feature` crean una base SQLite temporal. Cubren listado público, creación por reclutador, bloqueo por rol, postulación y actualización de estado. Ejecuta `php artisan test` para correrlas.
