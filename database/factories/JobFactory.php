<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'recruiter_id' => User::factory()->state(['role' => 'recruiter']),
            'title' => fake()->jobTitle(),
            'company_name' => fake()->company(),
            'location' => fake()->city(),
            'work_mode' => fake()->randomElement(['remote', 'hybrid', 'onsite']),
            'employment_type' => fake()->randomElement(['full_time', 'part_time', 'contract']),
            'description' => fake()->paragraphs(3, true),
            'salary_min' => fake()->numberBetween(30000, 80000),
            'salary_max' => fake()->numberBetween(80001, 140000),
            'status' => 'published',
        ];
    }
}
