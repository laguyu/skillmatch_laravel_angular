import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { JobApi } from '../../../../core/api/job-api';
import { CreateJobPayload, Job } from '../../../../core/models/job';

@Component({
  selector: 'app-my-jobs',
  imports: [ReactiveFormsModule],
  templateUrl: './my-jobs.html',
  styleUrl: './my-jobs.scss',
})
export class MyJobs implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly jobApi = inject(JobApi);

  protected readonly jobs = signal<Job[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly listError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly actionMessage = signal<string | null>(null);
  protected readonly salaryError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly editingJobId = signal<number | null>(null);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly deletingJobIds = signal<ReadonlySet<number>>(new Set());
  protected readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    company_name: ['', [Validators.required, Validators.maxLength(120)]],
    location: ['', [Validators.required, Validators.maxLength(120)]],
    work_mode: ['remote' as Job['work_mode'], [Validators.required]],
    employment_type: ['full_time' as Job['employment_type'], [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(80), Validators.maxLength(10000)]],
    salary_min: [''],
    salary_max: [''],
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  protected loadJobs(): void {
    this.isLoading.set(true);
    this.listError.set(null);

    this.jobApi
      .listMine()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (jobs) => this.jobs.set(jobs),
        error: () => this.listError.set('No se pudieron cargar tus vacantes. Intenta de nuevo.'),
      });
  }

  protected submit(): void {
    this.formError.set(null);
    this.successMessage.set(null);
    this.salaryError.set(null);

    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const salaryMin = values.salary_min === '' ? null : Number(values.salary_min);
    const salaryMax = values.salary_max === '' ? null : Number(values.salary_max);

    if ((salaryMin === null) !== (salaryMax === null)) {
      this.salaryError.set('Indica ambos valores salariales o deja ambos vacíos.');
      return;
    }

    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      this.salaryError.set('El salario mínimo no puede superar el máximo.');
      return;
    }

    const payload: CreateJobPayload = {
      title: values.title,
      company_name: values.company_name,
      location: values.location,
      work_mode: values.work_mode,
      employment_type: values.employment_type,
      description: values.description,
      salary_min: salaryMin,
      salary_max: salaryMax,
    };
    const editingJobId = this.editingJobId();
    const request = editingJobId === null
      ? this.jobApi.create(payload)
      : this.jobApi.update(editingJobId, payload);

    this.isSubmitting.set(true);

    request
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(editingJobId === null
            ? 'La vacante se publicó correctamente.'
            : 'La vacante se actualizó correctamente.');
          this.resetForm();
          this.loadJobs();
        },
        error: (error: HttpErrorResponse) => {
          const serverMessage = error.error?.message;
          this.formError.set(typeof serverMessage === 'string'
            ? serverMessage
            : editingJobId === null
              ? 'No se pudo publicar la vacante. Revisa los datos e inténtalo de nuevo.'
              : 'No se pudo actualizar la vacante. Inténtalo de nuevo.');
        },
      });
  }

  protected startEditing(job: Job): void {
    this.editingJobId.set(job.id);
    this.formError.set(null);
    this.successMessage.set(null);
    this.salaryError.set(null);
    this.form.reset({
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      work_mode: job.work_mode,
      employment_type: job.employment_type,
      description: job.description,
      salary_min: job.salary_min?.toString() ?? '',
      salary_max: job.salary_max?.toString() ?? '',
    });
    document.querySelector('.publish-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected cancelEditing(): void {
    this.resetForm();
    this.formError.set(null);
    this.salaryError.set(null);
    this.successMessage.set(null);
  }

  protected requestDelete(jobId: number): void {
    this.pendingDeleteId.set(jobId);
    this.actionError.set(null);
    this.actionMessage.set(null);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
    this.actionError.set(null);
  }

  protected isDeleting(jobId: number): boolean {
    return this.deletingJobIds().has(jobId);
  }

  protected confirmDelete(job: Job): void {
    if (this.pendingDeleteId() !== job.id || this.isDeleting(job.id)) {
      return;
    }

    this.deletingJobIds.update((jobIds) => new Set(jobIds).add(job.id));
    this.actionError.set(null);

    this.jobApi
      .remove(job.id)
      .pipe(finalize(() => this.deletingJobIds.update((jobIds) => {
        const nextJobIds = new Set(jobIds);
        nextJobIds.delete(job.id);

        return nextJobIds;
      })))
      .subscribe({
        next: () => {
          this.jobs.update((jobs) => jobs.filter((listedJob) => listedJob.id !== job.id));
          this.pendingDeleteId.set(null);
          this.actionMessage.set('La vacante se eliminó correctamente.');

          if (this.editingJobId() === job.id) {
            this.cancelEditing();
          }
        },
        error: (error: HttpErrorResponse) => {
          const serverMessage = error.error?.message;
          this.actionError.set(typeof serverMessage === 'string'
            ? serverMessage
            : 'No se pudo eliminar la vacante. Inténtalo de nuevo.');
        },
      });
  }

  private resetForm(): void {
    this.editingJobId.set(null);
    this.form.reset({
      title: '',
      company_name: '',
      location: '',
      work_mode: 'remote',
      employment_type: 'full_time',
      description: '',
      salary_min: '',
      salary_max: '',
    });
  }
}
