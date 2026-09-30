import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CreateJobPayload, Job, PaginatedResponse, ResourceResponse } from '../models/job';

export const API_URL = new InjectionToken<string>('api-url');

@Injectable({
  providedIn: 'root',
})
export class JobApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string,
  ) {}

  list(): Observable<Job[]> {
    return this.http
      .get<PaginatedResponse<Job>>(`${this.apiUrl}/jobs`)
      .pipe(map((response) => response.data));
  }

  listMine(): Observable<Job[]> {
    return this.http
      .get<PaginatedResponse<Job>>(`${this.apiUrl}/my/jobs`)
      .pipe(map((response) => response.data));
  }

  create(payload: CreateJobPayload): Observable<ResourceResponse<Job>> {
    return this.http.post<ResourceResponse<Job>>(`${this.apiUrl}/jobs`, payload);
  }

  update(jobId: number, payload: CreateJobPayload): Observable<ResourceResponse<Job>> {
    return this.http.patch<ResourceResponse<Job>>(`${this.apiUrl}/jobs/${jobId}`, payload);
  }

  remove(jobId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/jobs/${jobId}`);
  }
}
