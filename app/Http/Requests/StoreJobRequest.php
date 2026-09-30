<?php

namespace App\Http\Requests;

use App\Models\Job;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Job::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'company_name' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:120'],
            'work_mode' => ['required', Rule::in(['remote', 'hybrid', 'onsite'])],
            'employment_type' => ['required', Rule::in(['full_time', 'part_time', 'contract'])],
            'description' => ['required', 'string', 'min:80', 'max:10000'],
            'salary_min' => ['nullable', 'integer', 'min:0', 'required_with:salary_max', 'lte:salary_max'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'required_with:salary_min', 'gte:salary_min'],
            'status' => ['sometimes', Rule::in(['draft', 'published', 'closed'])],
        ];
    }
}
