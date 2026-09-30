import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { JobApplicationApi } from '../../../../core/api/job-application-api';
import { JobApi } from '../../../../core/api/job-api';
import { AuthSession } from '../../../../core/auth/auth-session';
import { Job } from '../../../../core/models/job';
import { JobList } from './job-list';

describe('JobList', () => {
  let fixture: ComponentFixture<JobList>;
  let jobApi: jasmine.SpyObj<JobApi>;
  let jobApplicationApi: jasmine.SpyObj<JobApplicationApi>;

  const job: Job = {
    id: 17,
    title: 'Desarrollador Laravel',
    company_name: 'Nube Norte',
    location: 'Remoto',
    work_mode: 'remote',
    employment_type: 'full_time',
    description: 'Construir APIs para productos digitales.',
    status: 'published',
    salary_min: null,
    salary_max: null,
    created_at: '2026-09-30T00:00:00.000000Z',
    recruiter: { id: 4, name: 'Equipo Demo', headline: null },
  };

  beforeEach(async () => {
    localStorage.removeItem('skillmatch-session');
    jobApi = jasmine.createSpyObj<JobApi>('JobApi', ['list']);
    jobApi.list.and.returnValue(throwError(() => new Error('API unavailable')));
    jobApplicationApi = jasmine.createSpyObj<JobApplicationApi>('JobApplicationApi', ['listMine', 'applyToJob']);
    jobApplicationApi.listMine.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [JobList],
      providers: [
        provideRouter([]),
        { provide: JobApi, useValue: jobApi },
        { provide: JobApplicationApi, useValue: jobApplicationApi },
      ],
    }).compileComponents();
  });

  it('shows the error state when loading jobs fails', () => {
    fixture = TestBed.createComponent(JobList);
    fixture.detectChanges();
    const feedback = fixture.nativeElement.querySelector('.feedback') as HTMLElement;

    expect(feedback.textContent).toContain('No se pudieron cargar las vacantes');
    expect(feedback.textContent).not.toContain('Cargando');
  });

  it('prompts unauthenticated visitors to sign in before applying', () => {
    jobApi.list.and.returnValue(of([job]));
    fixture = TestBed.createComponent(JobList);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const applyLink = root.querySelector<HTMLAnchorElement>('.apply-link');

    expect(applyLink?.textContent).toContain('Inicia sesión para postularte');
    expect(applyLink?.getAttribute('href')).toBe('/login');
    expect(jobApplicationApi.applyToJob).not.toHaveBeenCalled();
  });

  it('submits a candidate application and shows confirmation', () => {
    jobApi.list.and.returnValue(of([job]));
    jobApplicationApi.applyToJob.and.returnValue(of({
      data: {
        id: 23,
        status: 'submitted',
        job: { id: job.id, title: job.title, company_name: job.company_name },
      },
    }));
    TestBed.inject(AuthSession).setSession({
      token: 'candidate-token',
      user: {
        id: 9,
        name: 'Demo Candidate',
        email: 'candidate@example.test',
        role: 'candidate',
        headline: null,
      },
    });
    fixture = TestBed.createComponent(JobList);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.apply-button')!.click();
    fixture.detectChanges();

    expect(jobApplicationApi.applyToJob).toHaveBeenCalledOnceWith(job.id);
    expect(root.querySelector('.applied-label')?.textContent).toContain('Ya te postulaste');
    expect(root.querySelector('.application-message')?.textContent).toContain(
      'Tu postulación quedó registrada',
    );
  });
});