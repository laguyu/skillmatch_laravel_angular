# SkillMatch

SkillMatch is a web application for discovering job opportunities and managing applications. Users can browse vacancies, register as a candidate or recruiter, and access a workspace tailored to their role.

The application consists of a Laravel API and a modern Angular web client.

## Features

- Public browsing of published vacancies.
- Sign-up and login for candidate and recruiter accounts.
- Browser-based session management.
- Private user dashboard.
- Versioned API for vacancies and job applications.
- Role- and resource-ownership-based access control.

## Tech Stack

- Laravel 13, PHP 8.3, and Laravel Sanctum.
- Angular 20, TypeScript, SCSS, and RxJS.
- SQLite for local development.
- PHPUnit and Laravel Pint for backend quality checks.

## Quick Start

```powershell
# Terminal 1: Laravel API
php artisan migrate
php artisan serve

# Terminal 2: Angular application
Set-Location frontend
npm install
npm start
```

The Angular application is available at `http://localhost:4200`, and the API runs at `http://localhost:8000`.

## Documentation

- [Laravel technical guide](docs/LARAVEL.md)
- [Angular technical guide](docs/ANGULAR.md)
- [Architecture, SOLID, and code quality](docs/ARQUITECTURA_Y_CALIDAD.md)
- [Running the application and tests](docs/EJECUCION_Y_PRUEBAS.md)
- [Production deployment guide](docs/DESPLIEGUE.md)
- [UptimeRobot monitor setup](docs/UPTIMEROBOT.md)
