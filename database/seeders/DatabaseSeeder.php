<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $recruiter = User::query()->firstOrCreate(
            ['email' => 'recruiter.demo@skillmatch.test'],
            [
                'name' => 'Equipo SkillMatch Demo',
                'password' => Str::random(48),
                'role' => 'recruiter',
                'headline' => 'Equipo de selección',
            ],
        );

        $jobs = [
            [
                'title' => 'Desarrollador Laravel Junior',
                'company_name' => 'Nube Norte',
                'location' => 'Remoto - Latinoamérica',
                'work_mode' => 'remote',
                'employment_type' => 'full_time',
                'description' => 'Buscamos una persona desarrolladora junior para construir APIs y mantener aplicaciones Laravel junto a un equipo colaborativo.',
            ],
            [
                'title' => 'Frontend Developer Angular',
                'company_name' => 'Estudio Digital',
                'location' => 'Asunción, Paraguay',
                'work_mode' => 'hybrid',
                'employment_type' => 'full_time',
                'description' => 'Crearás interfaces accesibles y rápidas con Angular, TypeScript y pruebas automatizadas en productos usados por miles de personas.',
            ],
            [
                'title' => 'Analista de datos',
                'company_name' => 'Datos Abiertos',
                'location' => 'Remoto - América',
                'work_mode' => 'remote',
                'employment_type' => 'contract',
                'description' => 'Transformarás datos en reportes útiles, colaborarás con producto y documentarás hallazgos para equipos de negocio y tecnología.',
            ],
            [
                'title' => 'Diseñador UX/UI',
                'company_name' => 'Punto Creativo',
                'location' => 'Montevideo, Uruguay',
                'work_mode' => 'hybrid',
                'employment_type' => 'full_time',
                'description' => 'Investigarás necesidades de usuarios y diseñarás experiencias claras, prototipos y sistemas visuales en colaboración con ingeniería.',
            ],
            [
                'title' => 'QA Automation Engineer',
                'company_name' => 'Calidad Digital',
                'location' => 'Remoto - Latinoamérica',
                'work_mode' => 'remote',
                'employment_type' => 'full_time',
                'description' => 'Diseñarás estrategias de calidad y automatizarás pruebas para servicios web, trabajando cerca de desarrollo y producto.',
            ],
            [
                'title' => 'Soporte técnico de aplicaciones',
                'company_name' => 'Conecta Servicios',
                'location' => 'Ciudad del Este, Paraguay',
                'work_mode' => 'onsite',
                'employment_type' => 'part_time',
                'description' => 'Ayudarás a resolver incidencias de aplicaciones web, documentar soluciones y acompañar a clientes en el uso diario del producto.',
            ],
        ];

        foreach ($jobs as $job) {
            $recruiter->postedJobs()->firstOrCreate(
                [
                    'title' => $job['title'],
                    'company_name' => $job['company_name'],
                ],
                [...$job, 'status' => 'published'],
            );
        }
    }
}
