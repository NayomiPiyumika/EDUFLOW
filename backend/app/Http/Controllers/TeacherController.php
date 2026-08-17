<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    /**
     * GET /api/teachers
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'teacher');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->withCount('classesTaught')
                ->orderBy('name')
                ->paginate($request->integer('per_page', 15))
        );
    }

    /**
     * POST /api/teachers
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $teacher = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => 'teacher',
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json($teacher, 201);
    }

    /**
     * GET /api/teachers/{teacher}
     */
    public function show(User $teacher)
    {
        abort_unless($teacher->role === 'teacher', 404);

        return response()->json($teacher->load('classesTaught'));
    }

    /**
     * PUT/PATCH /api/teachers/{teacher}
     */
    public function update(Request $request, User $teacher)
    {
        abort_unless($teacher->role === 'teacher', 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($teacher->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $teacher->update($data);

        return response()->json($teacher->fresh());
    }

    /**
     * DELETE /api/teachers/{teacher}
     */
    public function destroy(User $teacher)
    {
        abort_unless($teacher->role === 'teacher', 404);

        $teacher->delete();

        return response()->json(['message' => 'Teacher removed successfully.']);
    }
}
