# Configuración de UptimeRobot

UptimeRobot no necesita un archivo con claves privadas dentro del proyecto. Se configura desde su panel web para consultar una ruta pública de estado.

## Monitor recomendado

| Campo de UptimeRobot | Valor |
| --- | --- |
| Monitor Type | `HTTPS(s)` |
| Friendly Name | `SkillMatch API` |
| URL | `https://TU-SERVICIO.onrender.com/up` |
| Monitoring Interval | `5 minutes` |
| Monitor Timeout | `30 seconds` |

Sustituye `TU-SERVICIO` por el subdominio que Render asigne a la API.

La ruta `/up` devuelve el JSON `{"status":"ok"}` y un estado HTTP 200. No exige autenticación ni revela información sensible.

## Notificaciones

Configura una alerta por email o Telegram. Así sabrás cuando Render no pueda iniciar el servicio, cuando falle una actualización o cuando la base de datos no responda.

## Qué garantiza el monitor

UptimeRobot detecta interrupciones y envía alertas; no garantiza que Render mantenga activo un servicio gratuito. Render Free suspende un web service tras 15 minutos sin tráfico y puede tardar cerca de un minuto en reactivarlo. Los pings periódicos no son una solución garantizada ni un sustituto de un plan always-on.

Para que la API no se suspenda por inactividad, usa un plan de cómputo pagado en Render. Incluso así, UptimeRobot solo detecta caídas: ningún monitor convierte una instancia única en disponibilidad del 100 %.
