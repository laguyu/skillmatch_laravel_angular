<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json([
            'data' => $this->authenticatedPayload($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if ($user === null || ! Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'Las credenciales son inválidas.'], 422);
        }

        return response()->json([
            'data' => $this->authenticatedPayload($user),
        ]);
    }

    public function logout(): JsonResponse
    {
        request()->user()->currentAccessToken()?->delete();

        return response()->json(status: 204);
    }

    /**
     * @return array{token: string, user: array{id: int, name: string, email: string, role: string, headline: ?string}}
     */
    private function authenticatedPayload(User $user): array
    {
        return [
            'token' => $user->createToken('skillmatch-web')->plainTextToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'headline' => $user->headline,
            ],
        ];
    }
}
