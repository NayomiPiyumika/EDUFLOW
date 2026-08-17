<?php

namespace App\Http\Controllers;

use App\Models\NotificationItem;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Returns notifications visible to the authenticated user:
     * directly addressed to them, targeted at their role, or targeted at "all".
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = NotificationItem::where(function ($q) use ($user) {
            $q->where('recipient_id', $user->id)
                ->orWhere('target_role', 'all')
                ->orWhere('target_role', $user->role);
        });

        if ($request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        return response()->json(
            $query->with('sender:id,name')->orderByDesc('created_at')->paginate($request->integer('per_page', 20))
        );
    }

    /**
     * POST /api/notifications
     * Create an announcement (admin only, per route middleware).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'recipient_id' => ['nullable', 'exists:users,id'],
            'target_role' => ['nullable', Rule::in(['all', 'admin', 'teacher', 'student'])],
            'class_id' => ['nullable', 'exists:classes,id'],
        ]);

        $notification = NotificationItem::create([
            ...$data,
            'sender_id' => $request->user()->id,
        ]);

        return response()->json($notification, 201);
    }

    /**
     * PATCH /api/notifications/{notification}/read
     */
    public function markRead(Request $request, NotificationItem $notification)
    {
        if ($notification->recipient_id && $notification->recipient_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json($notification->fresh());
    }
}
