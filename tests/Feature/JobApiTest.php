<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class JobApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_anyone_can_list_published_jobs(): void
    {
        Job::factory()->create(['status' => 'published']);
        Job::factory()->create(['status' => 'draft']);

        $response = $this->getJson('/api/v1/jobs');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'published');
    }

    public function test_a_recruiter_can_create_a_job(): void
    {
        $recruiter = User::factory()->create(['role' => 'recruiter']);

        $response = $this->actingAs($recruiter, 'sanctum')->postJson('/api/v1/jobs', [
            'title' => 'Senior Laravel Developer',
            'company_name' => 'SkillMatch Labs',
            'location' => 'Bogotá',
            'work_mode' => 'hybrid',
            'employment_type' => 'full_time',
            'description' => str_repeat('Desarrollar y mantener productos digitales escalables. ', 3),
            'salary_min' => 60000,
            'salary_max' => 85000,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Senior Laravel Developer')
            ->assertJsonPath('data.recruiter.id', $recruiter->id);

        $this->assertDatabaseHas('job_postings', [
            'recruiter_id' => $recruiter->id,
            'title' => 'Senior Laravel Developer',
        ]);
    }

    public function test_a_candidate_cannot_create_a_job(): void
    {
        $candidate = User::factory()->create(['role' => 'candidate']);

        $response = $this->actingAs($candidate, 'sanctum')->postJson('/api/v1/jobs', []);

        $response->assertForbidden();
    }

    public function test_a_recruiter_can_view_only_their_own_jobs(): void
    {
        $recruiter = User::factory()->create(['role' => 'recruiter']);
        $otherRecruiter = User::factory()->create(['role' => 'recruiter']);
        $publishedJob = Job::factory()->create(['recruiter_id' => $recruiter->id]);
        $draftJob = Job::factory()->create(['recruiter_id' => $recruiter->id, 'status' => 'draft']);
        Job::factory()->create(['recruiter_id' => $otherRecruiter->id]);

        $response = $this->actingAs($recruiter, 'sanctum')->getJson('/api/v1/my/jobs');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $publishedJob->id])
            ->assertJsonFragment(['id' => $draftJob->id]);
    }

    public function test_a_candidate_cannot_view_the_recruiter_job_management_list(): void
    {
        $candidate = User::factory()->create(['role' => 'candidate']);

        $response = $this->actingAs($candidate, 'sanctum')->getJson('/api/v1/my/jobs');

        $response->assertForbidden();
    }

    public function test_a_recruiter_can_update_their_own_job(): void
    {
        $recruiter = User::factory()->create(['role' => 'recruiter']);
        $job = Job::factory()->create(['recruiter_id' => $recruiter->id]);

        $response = $this->actingAs($recruiter, 'sanctum')->patchJson("/api/v1/jobs/{$job->id}", [
            'title' => 'Senior Laravel Developer',
        ]);

        $response->assertOk()->assertJsonPath('data.title', 'Senior Laravel Developer');
        $this->assertDatabaseHas('job_postings', [
            'id' => $job->id,
            'title' => 'Senior Laravel Developer',
        ]);
    }

    public function test_a_recruiter_can_delete_their_own_job(): void
    {
        $recruiter = User::factory()->create(['role' => 'recruiter']);
        $job = Job::factory()->create(['recruiter_id' => $recruiter->id]);

        $response = $this->actingAs($recruiter, 'sanctum')->deleteJson("/api/v1/jobs/{$job->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('job_postings', ['id' => $job->id]);
    }
}
