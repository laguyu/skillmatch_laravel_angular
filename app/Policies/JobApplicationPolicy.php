<?php

namespace App\Policies;

use App\JobApplicationStatus;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\User;

class JobApplicationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, JobApplication $jobApplication): bool
    {
        return $jobApplication->candidate_id === $user->id
            || ($user->role === 'recruiter' && $this->belongsToRecruiter($user, $jobApplication));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'candidate';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, JobApplication $jobApplication): bool
    {
        return $user->role === 'recruiter' && $this->belongsToRecruiter($user, $jobApplication);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, JobApplication $jobApplication): bool
    {
        return $jobApplication->candidate_id === $user->id
            && $jobApplication->status === JobApplicationStatus::Submitted;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, JobApplication $jobApplication): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, JobApplication $jobApplication): bool
    {
        return false;
    }

    private function belongsToRecruiter(User $user, JobApplication $jobApplication): bool
    {
        return Job::query()
            ->whereKey($jobApplication->job_id)
            ->where('recruiter_id', $user->id)
            ->exists();
    }
}
