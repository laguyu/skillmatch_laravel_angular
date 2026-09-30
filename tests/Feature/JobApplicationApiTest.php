<?php

namespace Tests\Feature;

use App\JobApplicationStatus;
use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class JobApplicationApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_a_candidate_can_apply_to_a_job(): void
    {
        $candidate = User::factory()->create(['role' => 'candidate']);
        $job = Job::factory()->create();

        $response = $this->actingAs($candidate, 'sanctum')->postJson("/api/v1/jobs/{$job->id}/applications", [
            'cover_letter' => 'Me interesa contribuir con mi experiencia en Laravel y Angular.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', JobApplicationStatus::Submitted->value)
            ->assertJsonPath('data.job.id', $job->id)
            ->assertJsonPath('data.candidate.id', $candidate->id);

        $this->assertDatabaseHas('job_applications', [
            'job_id' => $job->id,
            'candidate_id' => $candidate->id,
            'status' => JobApplicationStatus::Submitted->value,
        ]);
    }

    public function test_a_recruiter_can_update_the_status_of_an_application_for_its_job(): void
    {
        $recruiter = User::factory()->create(['role' => 'recruiter']);
        $job = Job::factory()->create(['recruiter_id' => $recruiter->id]);
        $candidate = User::factory()->create(['role' => 'candidate']);
        $application = $job->applications()->create(['candidate_id' => $candidate->id]);

        $response = $this->actingAs($recruiter, 'sanctum')->patchJson("/api/v1/applications/{$application->id}", [
            'status' => JobApplicationStatus::Interview->value,
        ]);

        $response->assertOk()->assertJsonPath('data.status', JobApplicationStatus::Interview->value);

        $this->assertDatabaseHas('job_applications', [
            'id' => $application->id,
            'status' => JobApplicationStatus::Interview->value,
        ]);
    }
}
