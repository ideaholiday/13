<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\LeadSubmitted;

class EnquiryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'packageId' => 'nullable|string',
            'packageTitle' => 'nullable|string',
            'travelDates' => 'nullable|date',
            'travelers' => 'nullable|string',
            'message' => 'nullable|string'
        ]);

        $enquiry = Enquiry::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'package_id' => $validated['packageId'] ?? null,
            'package_title' => $validated['packageTitle'] ?? null,
            'travel_date' => $validated['travelDates'] ?? null,
            'travelers' => $validated['travelers'] ?? '2',
            'message' => $validated['message'] ?? null,
            'status' => 'new'
        ]);

        // Send email to admin
        try {
            Mail::to(config('mail.admin_email', 'bookings@ideaholiday.in'))
                ->send(new LeadSubmitted($enquiry));
        } catch (\Exception $e) {
            \Log::error('Failed to send admin email: ' . $e->getMessage());
        }

        // Send confirmation to customer (optional)
        // Mail::to($enquiry->email)->send(new EnquiryConfirmation($enquiry));

        return response()->json([
            'success' => true,
            'data' => $enquiry,
            'message' => 'Enquiry submitted successfully'
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Enquiry::query();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        $enquiries = $query->recent()->paginate(20);
        return response()->json([
            'success' => true,
            'data' => $enquiries
        ]);
    }

    public function show($id)
    {
        $enquiry = Enquiry::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $enquiry
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,quoted,converted,lost',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|string'
        ]);
        $enquiry = Enquiry::findOrFail($id);
        $enquiry->update($validated);
        return response()->json([
            'success' => true,
            'data' => $enquiry,
            'message' => 'Enquiry updated successfully'
        ]);
    }
}
