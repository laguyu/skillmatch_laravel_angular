import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { JobApplicationApi } from '../../../../core/api/job-application-api';
import { AuthSession } from '../../../../core/auth/auth-session';
import { JobApi } from '../../../../core/api/job-api';
import { Job, JobApplicationSummary } from '../../../../core/models/job';

@Component({
  selector: 'app-job-list',
  imports: [RouterLink],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList implements OnInit {
  private readonly jobApi = inject(JobApi);
  private readonly jobApplicationApi = inject(JobApplicationApi);

  protected readonly authSession = inject(AuthSession);
  protected readonly jobs = signal<Job[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly applicationHistoryWarning = signal<string | null>(null);
  protected readonly appliedJobIds = signal<ReadonlySet<number>>(new Set());
  protected readonly applyingJobIds = signal<ReadonlySet<number>>(new Set());
  protected readonly applicationMessages = signal<Record<number, string>>({});

  ngOnInit(): void {
    const applicationsRequest = this.authSession.user()?.role === 'candidate'
      ? this.jobApplicationApi.listMine().pipe(
          catchError(() => {
            this.applicationHistoryWarning.set('No pudimos consultar tus postulaciones anteriores.');

            return of<JobApplicationSummary[]>([]);
          }),
        )
      : of<JobApplicationSummary[]>([]);

    forkJoin({ jobs: this.jobApi.list(), applications: applicationsRequest })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ jobs, applications }) => {
          this.jobs.set(jobs);
          this.appliedJobIds.set(new Set(applications.map((application) => application.job.id)));
        },
        error: () => this.errorMessage.set('No se pudieron cargar las vacantes. Intenta de nuevo más tarde.'),
      });
  }

  protected hasApplied(jobId: number): boolean {
    return this.appliedJobIds().has(jobId);
  }

  protected isApplying(jobId: number): boolean {
    return this.applyingJobIds().has(jobId);
  }

  protected applicationMessage(jobId: number): string | null {
    return this.applicationMessages()[jobId] ?? null;
  }

  protected applyToJob(job: Job): void {
    if (this.authSession.user()?.role !== 'candidate' || this.hasApplied(job.id) || this.isApplying(job.id)) {
      return;
    }

    this.applyingJobIds.update((jobIds) => new Set(jobIds).add(job.id));
    this.applicationMessages.update((messages) => {
      const nextMessages = { ...messages };
      delete nextMessages[job.id];

      return nextMessages;
    });

    this.jobApplicationApi
      .applyToJob(job.id)
      .pipe(finalize(() => this.applyingJobIds.update((jobIds) => {
        const nextJobIds = new Set(jobIds);
        nextJobIds.delete(job.id);

        return nextJobIds;
      })))
      .subscribe({
        next: () => {
          this.appliedJobIds.update((jobIds) => new Set(jobIds).add(job.id));
          this.applicationMessages.update((messages) => ({
            ...messages,
            [job.id]: 'Tu postulación quedó registrada.',
          }));
        },
        error: (error: HttpErrorResponse) => {
          const serverMessage = error.error?.message;

          this.applicationMessages.update((messages) => ({
            ...messages,
            [job.id]: typeof serverMessage === 'string'
              ? serverMessage
              : 'No se pudo enviar la postulación. Inténtalo de nuevo.',
          }));
        },
      });
  }
}
