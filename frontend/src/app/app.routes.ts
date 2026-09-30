import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { recruiterGuard } from './core/auth/recruiter.guard';

export const routes: Routes = [
	{
		path: '',
		title: 'SkillMatch | Talento que conecta',
		loadComponent: () => import('./features/jobs/pages/job-list/job-list').then((module) => module.JobList),
	},
	{ path: 'login', title: 'Iniciar sesión | SkillMatch', loadComponent: () => import('./features/auth/pages/login/login').then((module) => module.Login) },
	{ path: 'registro', title: 'Crear cuenta | SkillMatch', loadComponent: () => import('./features/auth/pages/register/register').then((module) => module.Register) },
	{ path: 'dashboard', title: 'Panel | SkillMatch', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then((module) => module.Dashboard) },
	{ path: 'mis-vacantes', title: 'Mis vacantes | SkillMatch', canActivate: [authGuard, recruiterGuard], loadComponent: () => import('./features/jobs/pages/my-jobs/my-jobs').then((module) => module.MyJobs) },
	{ path: '**', redirectTo: '' },
];
