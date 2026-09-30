# Despliegue a producción

La ruta elegida es **Vercel para Angular y Laravel** en dos proyectos conectados al mismo repositorio, con **Neon PostgreSQL** como base externa. Angular se publica como archivos estáticos; Laravel se ejecuta mediante el runtime comunitario `vercel-php`, no mediante Docker.

El runtime PHP está mantenido por la comunidad y no es un runtime oficial de Vercel.

## Vercel: configuración de los dos proyectos

### API Laravel

1. Crea un proyecto Vercel desde el repositorio y establece **Root Directory** en `.` (la raíz). En **Settings → Build and Deployment**, configura **Framework Preset** como **Other**; deja **Build Command** y **Output Directory** sin override y **Install Command** en automático. El `vercel.json` raíz también fija Framework en `Other`, configura `api/index.php` con `vercel-php@0.7.4` (PHP 8.3) y transfiere cada solicitud a Laravel.
2. Crea una base PostgreSQL en Neon Free y copia su connection string con SSL.
3. En **Settings → Environment Variables** del proyecto API configura estas variables en Production:

| Variable | Valor |
| --- | --- |
| `APP_KEY` | Resultado local de `php artisan key:generate --show`, incluido el prefijo `base64:`. |
| `APP_URL` | Dominio de producción del proyecto API, por ejemplo `https://skillmatch-api.vercel.app`. |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | Connection string PostgreSQL de Neon. Trátala como secreto. |

`APP_ENV=production`, `APP_DEBUG=false`, `CACHE_STORE=database`, `LOG_CHANNEL=stderr`, `SESSION_DRIVER=array` y las rutas de caché/plantillas en `/tmp` están definidas en `vercel.json`. `DB_URL` está soportada por `config/database.php`. No subas `.env` ni credenciales al repositorio.

### Migraciones iniciales

Después de guardar las variables de producción en Vercel, vincula la CLI al proyecto API y descarga su entorno:

```powershell
npx vercel link
npx vercel env pull .env.production --environment=production
```

Vercel no descarga los valores secretos: sustituye `DB_URL` y `APP_KEY` en `.env.production` por los valores reales antes de ejecutar Artisan. Para migraciones locales, copia desde Neon **Connect** la URL con **Connection pooling desactivado** (host sin `-pooler`) y úsala como `DB_URL` local. La API de Vercel puede conservar la URL pooled en sus variables de Production.

Comprueba el estado y ejecuta el esquema:

```powershell
php artisan migrate:status --env=production
php artisan migrate --env=production --force
php artisan db:seed --env=production --force
```

`.env.production` está excluido de Git. No ejecutes `migrate:fresh` contra la base de producción. El seeder agrega la cuenta reclutadora y las vacantes demo de forma idempotente.

### Angular

1. Crea un segundo proyecto Vercel desde el mismo repositorio y establece **Root Directory** en `frontend`.
2. Usa **Build Command** `npm run build` y **Output Directory** `dist/skillmatch-web/browser`.
3. Despliega primero la API. En el proyecto de la API, abre **Settings → Domains** y copia el dominio de producción, por ejemplo `https://skillmatch-api.vercel.app`.
4. Configura el proxy de Angular con ese dominio:
   - Abre [frontend/vercel.json](../frontend/vercel.json) y busca `REPLACE-WITH-LARAVEL-PROJECT.vercel.app`.
   - Reemplaza únicamente ese hostname por el dominio copiado, sin añadir una ruta ni una barra final. Por ejemplo, `"destination": "https://skillmatch-api.vercel.app/api/:path*"`.
   - Conserva `/api/:path*` al final. Guarda el cambio y envíalo al repositorio; Vercel volverá a desplegar el proyecto Angular. Si no tienes despliegue conectado a Git, inicia un nuevo deployment desde Vercel.

[environment.production.ts](../frontend/src/environments/environment.production.ts) ya usa `/api/v1`, así que no cambies ese valor. Por ejemplo, una llamada del frontend a `/api/v1/jobs` se reescribe al dominio de la API como `/api/v1/jobs`. Las demás rutas devuelven `index.html` para Angular Router.

El proxy usa el dominio del proyecto Angular para las llamadas del navegador, así que no hace falta habilitar CORS para ese flujo.

## Otras opciones de demo

Si Vercel no resulta adecuado, el repositorio conserva una configuración Render Free y las alternativas temporales de Cloudflare Tunnel y Google Cloud que se describen abajo. Todas tienen límites de disponibilidad o requisitos de cuenta/facturación.

## Demo sin tarjeta: Cloudflare Pages + Quick Tunnel

Cloudflare Pages publica Angular. Laravel y SQLite permanecen en tu equipo; `cloudflared` crea una URL HTTPS temporal que dirige solicitudes al servidor Laravel local. La documentación oficial indica que los Quick Tunnels no necesitan cuenta ni dominio, pero la URL cambia al reiniciar el túnel y no hay garantía de disponibilidad.

### 1. Levantar Laravel

Desde la raíz del proyecto, en una terminal:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Comprueba que responde en `http://127.0.0.1:8000/up`.

### 2. Exponer la API con Cloudflare Quick Tunnel

Instala `cloudflared` desde [las instrucciones oficiales](https://developers.cloudflare.com/tunnel/downloads/). En otra terminal ejecuta:

```powershell
cloudflared tunnel --url http://localhost:8000
```

El comando imprimirá una URL parecida a `https://nombre-aleatorio.trycloudflare.com`. Esa URL solo funciona mientras sigan activos tanto `php artisan serve` como `cloudflared`. No compartas una URL de túnel si no quieres que otras personas accedan a la aplicación.

### 3. Publicar Angular y SQLite

1. Cambia `apiUrl` en `frontend/src/environments/environment.production.ts` a `https://nombre-aleatorio.trycloudflare.com/api/v1`.
2. Publica `frontend` en Cloudflare Pages con `npm run build` y directorio `dist/skillmatch-web/browser`.
3. Si el túnel se reinicia y cambia de URL, actualiza `apiUrl` y vuelve a publicar Angular.
4. La base `database/database.sqlite` permanece en tu PC; haz respaldos y no la subas al repositorio.
5. Configura CORS para permitir el dominio público de Angular (`https://TU-PROYECTO.pages.dev`).

En resumen: Angular queda publicado en Internet, pero las llamadas a Laravel y la base de datos solo funcionan mientras tu computadora esté encendida, conectada y ejecutando los dos procesos.

## Google Cloud Compute Engine Always Free, si está disponible para ti

Google Cloud publica una cuota gratuita mensual de una VM no interrumpible `e2-micro`, 30 GB-mes de disco persistente estándar y 1 GB mensual de salida de red desde Norteamérica. La VM gratuita solo aplica en estas regiones de Estados Unidos: `us-west1` (Oregón), `us-central1` (Iowa) o `us-east1` (Carolina del Sur). Revisa los [límites vigentes](https://docs.cloud.google.com/free/docs/free-cloud-features) antes de crear recursos.

### Condiciones y riesgo de cargos

- El nivel gratuito no tiene fecha de vencimiento, pero Google requiere una cuenta de facturación activa para usar el Free Tier. La verificación puede requerir un medio de pago y su disponibilidad depende del país.
- Si superas las cuotas gratuitas (por ejemplo, la transferencia mensual), Google puede cobrar el excedente en una cuenta de facturación pagada. Una alerta de presupuesto notifica el gasto, pero no lo detiene automáticamente.
- Si el registro, facturación o región no está disponible para ti, no intentes el despliegue hasta confirmar que puedes usar el servicio.
- Una VM única puede reiniciarse o tener mantenimiento. Always Free no significa SLA de 100 %.

### Arquitectura sin base de datos adicional

- Google Cloud VM `e2-micro`: Nginx + PHP 8.3 + Laravel API.
- SQLite alojada en el disco persistente de la VM: evita pagar una base externa para una demo pequeña. Incluye copias de respaldo porque el disco de la VM es el almacenamiento de datos.
- Cloudflare Pages: archivos estáticos de Angular, entregados desde CDN.

Antes de configurar una VM, confirma que Angular apunte a la IP o dominio de la API, abre únicamente HTTP/HTTPS en el firewall, configura HTTPS y limita el acceso SSH. Mantén los archivos `.env` fuera de Git.

### Pasos generales

1. Comprueba que puedes abrir Google Cloud y crear una cuenta de facturación desde tu país.
2. Crea una VM con Ubuntu en una de las tres regiones admitidas por el Free Tier y selecciona `e2-micro`.
3. Comprueba en la estimación de costos que la máquina, el disco estándar (hasta 30 GB-mes) y la región están dentro del Free Tier. No añadas IP, disco, balanceador u otros productos de pago sin revisar su costo.
4. Instala Nginx y PHP 8.3 con las extensiones de Laravel; despliega la API con su document root en `public/` y configura SQLite sobre el disco persistente.
5. Configura reglas de firewall para HTTPS y SSH restringido. Publica Angular en Cloudflare Pages con `npm run build` y salida `dist/skillmatch-web/browser`.
6. Configura la URL de la API en `frontend/src/environments/environment.production.ts`, CORS para el dominio Pages y HTTPS para ambos sitios.
7. Configura alertas de presupuesto y supervisa el uso de transferencia y recursos. Las alertas no son un tope de gasto.

Esta opción puede mantenerse sin costo mientras la cuenta sea elegible y todos los consumos permanezcan dentro de las cuotas. El tráfico de salida gratuito está limitado a 1 GB mensual y la región del servidor está fija en Estados Unidos, así que la latencia y la transferencia pueden ser inconvenientes.

## Render Free para una demo temporal

El `render.yaml` del repositorio ahora usa únicamente el servicio Free y no aprovisiona una base pagada. Para crearlo:

1. Crea una base PostgreSQL en un proveedor compatible, por ejemplo Neon, y copia su connection string.
2. En Render crea un Blueprint desde el repositorio. Cuando solicite `APP_KEY`, pega el resultado de `php artisan key:generate --show` (incluye `base64:`).
3. Cuando solicite `DB_URL`, coloca la cadena de conexión PostgreSQL de ese proveedor y conserva SSL como lo indique el proveedor.
4. Verifica la API en `https://TU-SERVICIO.onrender.com/up`.

La base conserva los datos, pero Render Free duerme la API tras 15 minutos sin tráfico. Al volver a entrar puede haber demora; esta combinación no es always-on.

### No uses la base PostgreSQL gratuita de Render para datos que deban conservarse

La base PostgreSQL Free de Render expira a los 30 días. Además, el filesystem de una instancia Render es efímero: SQLite local puede perderse en reinicios, suspensión o nuevo despliegue.

## Angular en Cloudflare Pages

1. En [frontend/src/environments/environment.production.ts](../frontend/src/environments/environment.production.ts), configura la URL real, por ejemplo `https://TU-SERVICIO.onrender.com/api/v1`.
2. En Cloudflare Pages conecta el mismo repositorio.
3. Usa estos valores:

| Ajuste | Valor |
| --- | --- |
| Directorio base | `frontend` |
| Comando de build | `npm run build` |
| Directorio publicado | `dist/skillmatch-web/browser` |
| Versión Node.js | 20.19 o superior |

4. Configura CORS en Laravel para permitir el dominio exacto de Pages.
5. Comprueba en las herramientas del navegador que las solicitudes llegan a la URL de Render y no a `localhost`.

## UptimeRobot

UptimeRobot sirve para **detectar** interrupciones y enviarte alertas, no para mantener encendida una plataforma gratuita ni evitar suspensiones.

## Si también necesitas que funcione con tu PC apagada

- Render Free puede alojar Laravel sin costo, pero duerme la API por inactividad; Cloudflare Pages puede publicar Angular gratis. Esta combinación es para una demo con arranque en frío.
- Google Cloud Free Tier puede mantener una VM dentro de la cuota sin cargo, pero requiere facturación activa, puede requerir tarjeta y solo admite la VM gratuita en regiones de EE. UU.
- Si no puedes usar estas opciones y no puedes pagar, no hay una alternativa que garantice Laravel público 24/7 con la PC apagada.

Si no hay un proveedor gratuito Always Free accesible en tu país y no se acepta ningún gasto, no hay una forma fiable de tener la API Laravel ejecutándose 24/7 en Internet. La opción gratis será aceptar suspensión/arranque en frío o mantener un equipo propio encendido.

## Configuración CORS de Laravel

Si Angular se publica en otro dominio, Laravel debe permitir solo su origen. Publica la configuración cuando aún no exista:

```sh
php artisan config:publish cors
```

En `config/cors.php`, permite solo el origen real y las rutas API. No uses `*` en producción para rutas autenticadas.

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['https://TU-PROYECTO.pages.dev'],
'allowed_headers' => ['*'],
```

Tras cambiar variables o CORS en Render, el despliegue ejecuta `php artisan config:cache`.

## Lista de comprobación posterior

- `APP_DEBUG=false`.
- El certificado HTTPS está activo en API y frontend.
- La URL de API de producción no contiene `localhost` ni `example.com`.
- Las migraciones terminaron correctamente.
- La VM y el disco están dentro de cuotas gratuitas elegibles o se aceptó explícitamente el costo.
- `APP_KEY` comienza con `base64:` y no está guardada en Git.
- Los archivos `.env` y bases locales no están incluidos en la imagen o repositorio público.
- `php artisan config:cache` se ejecutó durante el despliegue.
- Las rutas protegidas responden 401 sin token y funcionan con token válido.
- CORS solo permite el dominio frontend configurado.
- Se guardaron copias de respaldo de la base de datos.

> El frontend actual guarda el token, pero todavía no envía automáticamente la cabecera `Authorization: Bearer <token>`. Antes de usar rutas protegidas desde Angular en producción, debe añadirse un interceptor HTTP.
