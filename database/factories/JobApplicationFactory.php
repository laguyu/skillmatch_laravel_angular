<?php

namespace Database\Factories;

use App\JobApplicationStatus;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_id' => Job::factory(),
            'candidate_id' => User::factory()->state(['role' => 'candidate']),
            'cover_letter' => fake()->paragraph(),
            'status' => JobApplicationStatus::Submitted,
        ];
    }
}
