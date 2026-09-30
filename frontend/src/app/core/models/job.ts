export interface Job {
	id: number;
	title: string;
	company_name: string;
	location: string;
	work_mode: 'remote' | 'hybrid' | 'onsite';
	employment_type: 'full_time' | 'part_time' | 'contract';
	description: string;
	status: 'draft' | 'published' | 'closed';
	salary_min: number | null;
	salary_max: number | null;
	applications_count?: number;
	created_at: string;
	recruiter: {
		id: number;
		name: string;
		headline: string | null;
	};
}

export interface PaginatedResponse<T> {
	data: T[];
}

export interface ResourceResponse<T> {
	data: T;
}

export interface CreateJobPayload {
	title: string;
	company_name: string;
	location: string;
	work_mode: Job['work_mode'];
	employment_type: Job['employment_type'];
	description: string;
	salary_min: number | null;
	salary_max: number | null;
}

export type JobApplicationStatus = 'submitted' | 'reviewing' | 'interview' | 'rejected' | 'accepted';

export interface JobApplicationSummary {
	id: number;
	status: JobApplicationStatus;
	job: {
		id: number;
		title: string;
		company_name: string;
	};
}

export interface JobApplicationResponse {
	data: JobApplicationSummary;
}

export type UserRole = 'candidate' | 'recruiter';

export interface AuthenticatedUser {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	headline: string | null;
}

export interface AuthResponse {
	data: {
		token: string;
		user: AuthenticatedUser;
	};
}
