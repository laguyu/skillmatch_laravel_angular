import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { JobApi } from '../../../../core/api/job-api';
import { Job } from '../../../../core/models/job';
import { MyJobs } from './my-jobs';

describe('MyJobs', () => {
  let fixture: ComponentFixture<MyJobs>;
  let jobApi: jasmine.SpyObj<JobApi>;

  const publishedJob: Job = {
    id: 21,
    title: 'Desarrollador Laravel',
    company_name: 'Nube Norte',
    location: 'Remoto - Latinoamérica',
    work_mode: 'remote',
    employment_type: 'full_time',
    description: 'Desarrollar APIs escalables y colaborar con el equipo de producto para entregar soluciones digitales de calidad.',
    status: 'published',
    salary_min: null,
    salary_max: null,
    applications_count: 2,
    created_at: '2026-09-30T00:00:00.000000Z',
    recruiter: { id: 7, name: 'Equipo Demo', headline: null },
  };

  beforeEach(async () => {
    jobApi = jasmine.createSpyObj<JobApi>('JobApi', ['listMine', 'create', 'update', 'remove']);
    jobApi.listMine.and.returnValue(of([publishedJob]));
    jobApi.create.and.returnValue(of({ data: publishedJob }));
    jobApi.update.and.returnValue(of({ data: publishedJob }));
    jobApi.remove.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [MyJobs],
      providers: [{ provide: JobApi, useValue: jobApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyJobs);
    fixture.detectChanges();
  });

  it('creates a vacancy and refreshes the recruiter list', () => {
    const root = fixture.nativeElement as HTMLElement;
    const fields: Record<string, string> = {
      title: 'Desarrollador Laravel',
      company: 'Nube Norte',
      location: 'Remoto - Latinoamérica',
      description: 'Buscamos a alguien para construir APIs, documentar servicios y colaborar con el equipo de producto.',
    };

    for (const [id, value] of Object.entries(fields)) {
      const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }

    fixture.detectChanges();
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(jobApi.create).toHaveBeenCalledOnceWith({
      title: 'Desarrollador Laravel',
      company_name: 'Nube Norte',
      location: 'Remoto - Latinoamérica',
      work_mode: 'remote',
      employment_type: 'full_time',
      description: 'Buscamos a alguien para construir APIs, documentar servicios y colaborar con el equipo de producto.',
      salary_min: null,
      salary_max: null,
    });
    expect(jobApi.listMine).toHaveBeenCalledTimes(2);
    expect(root.querySelector('.success-message')?.textContent).toContain('publicó correctamente');
    expect(root.querySelector('.vacancy-row h3')?.textContent).toContain('Desarrollador Laravel');
    expect(root.querySelector('.vacancy-row footer')?.textContent).toContain('2 postulaciones');
  });

  it('loads a vacancy into the form and sends updates to the API', () => {
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.edit-button')!.click();
    fixture.detectChanges();

    const title = root.querySelector<HTMLInputElement>('#title')!;
    expect(title.value).toBe(publishedJob.title);
    title.value = 'Desarrollador Laravel Senior';
    title.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(jobApi.update).toHaveBeenCalledOnceWith(publishedJob.id, {
      title: 'Desarrollador Laravel Senior',
      company_name: publishedJob.company_name,
      location: publishedJob.location,
      work_mode: publishedJob.work_mode,
      employment_type: publishedJob.employment_type,
      description: publishedJob.description,
      salary_min: null,
      salary_max: null,
    });
    expect(root.querySelector('.success-message')?.textContent).toContain('actualizó correctamente');
  });

  it('requires confirmation before deleting a vacancy', () => {
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.delete-button')!.click();
    fixture.detectChanges();

    expect(jobApi.remove).not.toHaveBeenCalled();
    expect(root.querySelector('.delete-confirmation')?.textContent).toContain('2 postulaciones');

    root.querySelector<HTMLButtonElement>('.delete-confirmation .delete-button')!.click();
    fixture.detectChanges();

    expect(jobApi.remove).toHaveBeenCalledOnceWith(publishedJob.id);
    expect(root.querySelector('.vacancy-row')).toBeNull();
    expect(root.querySelector('.success-message')?.textContent).toContain('eliminó correctamente');
  });
});