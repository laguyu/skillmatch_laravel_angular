import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { JobApplicationResponse, JobApplicationSummary, PaginatedResponse } from '../models/job';
import { API_URL } from './job-api';

@Injectable({
  providedIn: 'root',
})
export class JobApplicationApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string,
  ) {}

  listMine(): Observable<JobApplicationSummary[]> {
    return this.http
      .get<PaginatedResponse<JobApplicationSummary>>(`${this.apiUrl}/applications`)
      .pipe(map((response) => response.data));
  }

  applyToJob(jobId: number): Observable<JobApplicationResponse> {
    return this.http.post<JobApplicationResponse>(`${this.apiUrl}/jobs/${jobId}/applications`, {});
  }
}
