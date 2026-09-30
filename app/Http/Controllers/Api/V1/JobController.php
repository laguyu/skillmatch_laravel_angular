<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobRequest;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Resources\V1\JobResource;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JobController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $jobs = Job::query()
            ->with('recruiter:id,name,headline')
            ->where('status', 'published')
            ->when($request->filled('search'), fn ($query) => $query->where('title', 'like', '%'.$request->string('search').'%'))
            ->when($request->filled('location'), fn ($query) => $query->where('location', $request->string('location')))
            ->when($request->filled('work_mode'), fn ($query) => $query->where('work_mode', $request->string('work_mode')))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return JobResource::collection($jobs);
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        $this->authorize('create', Job::class);

        $jobs = Job::query()
            ->whereBelongsTo($request->user(), 'recruiter')
            ->with('recruiter:id,name,headline')
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(12);

        return JobResource::collection($jobs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJobRequest $request): JsonResponse
    {
        $this->authorize('create', Job::class);

        $job = $request->user()->postedJobs()->create($request->validated());

        return (new JobResource($job->load('recruiter:id,name,headline')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Job $job): JobResource
    {
        return new JobResource($job->load('recruiter:id,name,headline'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJobRequest $request, Job $job): JobResource
    {
        $this->authorize('update', $job);

        $job->update($request->validated());

        return new JobResource($job->load('recruiter:id,name,headline'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Job $job): JsonResponse
    {
        $this->authorize('delete', $job);
        $job->delete();

        return response()->json(status: 204);
    }
}
