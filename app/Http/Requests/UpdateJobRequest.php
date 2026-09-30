<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:120'],
            'company_name' => ['sometimes', 'string', 'max:120'],
            'location' => ['sometimes', 'string', 'max:120'],
            'work_mode' => ['sometimes', Rule::in(['remote', 'hybrid', 'onsite'])],
            'employment_type' => ['sometimes', Rule::in(['full_time', 'part_time', 'contract'])],
            'description' => ['sometimes', 'string', 'min:80', 'max:10000'],
            'salary_min' => ['nullable', 'integer', 'min:0', 'required_with:salary_max', 'lte:salary_max'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'required_with:salary_min', 'gte:salary_min'],
            'status' => ['sometimes', Rule::in(['draft', 'published', 'closed'])],
        ];
    }
}
