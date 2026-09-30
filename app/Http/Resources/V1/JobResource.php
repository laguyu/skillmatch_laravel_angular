<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'company_name' => $this->company_name,
            'location' => $this->location,
            'work_mode' => $this->work_mode,
            'employment_type' => $this->employment_type,
            'description' => $this->description,
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'status' => $this->status,
            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at,
            'recruiter' => $this->whenLoaded('recruiter', fn () => [
                'id' => $this->recruiter->id,
                'name' => $this->recruiter->name,
                'headline' => $this->recruiter->headline,
            ]),
        ];
    }
}
