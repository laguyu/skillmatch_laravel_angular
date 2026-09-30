<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationStatusRequest;
use App\Http\Resources\V1\JobApplicationResource;
use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JobApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', JobApplication::class);

        $applications = JobApplication::query()
            ->with(['job:id,recruiter_id,title,company_name', 'candidate:id,name,headline'])
            ->when(
                $request->user()->role === 'candidate',
                fn ($query) => $query->whereBelongsTo($request->user(), 'candidate'),
                fn ($query) => $query->whereHas('job', fn ($jobQuery) => $jobQuery->whereBelongsTo($request->user(), 'recruiter')),
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(12);

        return JobApplicationResource::collection($applications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJobApplicationRequest $request, Job $job): JsonResponse
    {
        $this->authorize('create', JobApplication::class);

        $application = $job->applications()->firstOrCreate(
            ['candidate_id' => $request->user()->id],
            $request->validated(),
        );

        return (new JobApplicationResource($application->load(['job:id,title,company_name', 'candidate:id,name,headline'])))
            ->response()
            ->setStatusCode($application->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(JobApplication $application): JobApplicationResource
    {
        $this->authorize('view', $application);

        return new JobApplicationResource($application->load(['job:id,title,company_name', 'candidate:id,name,headline']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJobApplicationStatusRequest $request, JobApplication $application): JobApplicationResource
    {
        $this->authorize('update', $application);
        $application->update($request->validated());

        return new JobApplicationResource($application->load(['job:id,title,company_name', 'candidate:id,name,headline']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobApplication $application): JsonResponse
    {
        $this->authorize('delete', $application);
        $application->delete();

        return response()->json(status: 204);
    }
}
