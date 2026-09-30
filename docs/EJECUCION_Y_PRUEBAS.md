# Ejecución y pruebas

## Primera instalación

Desde la carpeta principal:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

Si `.env` ya existe, omite el segundo comando. Las migraciones crean las tablas locales, incluyendo usuarios, tokens, vacantes y candidaturas. `db:seed` agrega un reclutador demo y seis vacantes ficticias publicadas; puedes repetirlo sin duplicar esos registros.

Después instala el frontend:

```powershell
Set-Location frontend
npm install
```

## Ejecutar en desarrollo

Se necesitan dos terminales abiertas.

### Terminal de Laravel

Desde la raíz del proyecto:

```powershell
php artisan serve
```

La API estará en `http://localhost:8000`.

### Terminal de Angular

Desde `frontend/`:

```powershell
npm start
```

La web estará en `http://localhost:4200`.

## Probar el backend

Ejecuta toda la suite:

```powershell
php artisan test
```

Ejecuta solo el módulo principal:

```powershell
php artisan test --compact tests/Feature/JobApiTest.php tests/Feature/JobApplicationApiTest.php
```

Las pruebas usan SQLite en memoria y no alteran la base local de desarrollo.

## Formato PHP

```powershell
vendor\bin\pint --format agent
```

## Comprobar el frontend

Desde `frontend/`:

```powershell
npm run build
```

Este comando verifica el tipado TypeScript, las plantillas Angular, las rutas y genera el resultado optimizado en `frontend/dist/skillmatch-web`.

## Comprobación manual recomendada

1. Visita `http://localhost:4200` y confirma que la lista maneje correctamente carga, error o lista vacía.
2. Registra una cuenta de candidato en `/registro`.
3. Confirma que se redirige a `/dashboard`.
4. Vuelve a **Vacantes** y pulsa **Postularme** en una vacante.
5. Confirma el mensaje de postulación y recarga la página: debe indicar **Ya te postulaste**.
6. Pulsa **Cerrar sesión** y verifica que vuelve la navegación de visitante.
7. Prueba `/dashboard` sin una sesión guardada: debe redirigir a `/login`.
8. Registra otra cuenta como reclutador, abre `/mis-vacantes` y publica una vacante con una descripción de al menos 80 caracteres.
9. Confirma que aparece en **Mis vacantes** y en el catálogo público; verifica que un candidato no pueda acceder a `/mis-vacantes`.
10. Pulsa **Editar**, cambia el puesto o descripción y usa **Guardar cambios**; verifica que el listado refleje el cambio.
11. Pulsa **Eliminar** y comprueba que la confirmación indica cuántas postulaciones se eliminarían. Cancela y verifica que la vacante sigue; confirma y verifica que desaparece.

La gestión de vacantes y postulaciones se valida también en Laravel: solo el reclutador propietario puede editar o eliminar su vacante.
