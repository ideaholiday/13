# Enquiry & Lead Management Guide

## 📋 Overview

This guide explains how enquiries/leads are handled in the iHoliday system and where to check them.

---

## 🔄 Current State (Development)

### Where Enquiries Go Now:
Currently, when a user submits an enquiry form:
1. ✅ Data is logged to **browser console**
2. ✅ Form shows success message
3. ❌ **NOT saved to database yet** (needs backend integration)
4. ❌ **NO email notifications yet** (needs backend integration)

### Console Output Format:
```
=== NEW ENQUIRY SUBMITTED ===
Package: Dubai Adventure Package
Package ID: rec_2
Customer Name: John Doe
Email: john@example.com
Phone: +91 98765 43210
Travel Date: 2026-01-15
Travelers: 2
Message: Looking for honeymoon package with spa
Submitted At: 2025-10-17T10:30:45.123Z
=============================
```

### To Check Enquiries (Development):
1. Open browser **DevTools** (F12 or Cmd+Option+I on Mac)
2. Go to **Console** tab
3. Submit an enquiry through the form
4. See the logged details in console

---

## ✅ Production Setup (To Implement)

### Backend API Integration

#### 1. Create Backend API Endpoint
**File**: `ih-backend/routes/api.php`

```php
use App\Http\Controllers\Api\V1\EnquiryController;

Route::prefix('v1')->group(function () {
    // ... existing routes
    
    // Enquiry routes
    Route::post('/enquiries', [EnquiryController::class, 'store']);
    Route::get('/enquiries', [EnquiryController::class, 'index']);
    Route::get('/enquiries/{id}', [EnquiryController::class, 'show']);
    Route::patch('/enquiries/{id}/status', [EnquiryController::class, 'updateStatus']);
});
```

#### 2. Create Database Migration
**File**: `ih-backend/database/migrations/2025_10_17_create_enquiries_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('package_id')->nullable();
            $table->string('package_title')->nullable();
            $table->date('travel_date')->nullable();
            $table->string('travelers')->default('2');
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'contacted', 'quoted', 'converted', 'lost'])->default('new');
            $table->string('assigned_to')->nullable(); // Team member who handles this
            $table->text('notes')->nullable(); // Internal notes
            $table->timestamps();
            
            $table->index('email');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
```

**Run migration**:
```bash
cd ih-backend
php artisan migrate
```

#### 3. Create Enquiry Model
**File**: `ih-backend/app/Models/Enquiry.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'package_id',
        'package_title',
        'travel_date',
        'travelers',
        'message',
        'status',
        'assigned_to',
        'notes'
    ];

    protected $casts = [
        'travel_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Scopes for filtering
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
```

#### 4. Create Enquiry Controller
**File**: `ih-backend/app/Http/Controllers/Api/V1/EnquiryController.php`

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EnquiryReceived;
use App\Mail\EnquiryConfirmation;

class EnquiryController extends Controller
{
    /**
     * Store new enquiry
     */
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

        // Create enquiry
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
                ->send(new EnquiryReceived($enquiry));
        } catch (\Exception $e) {
            \Log::error('Failed to send admin email: ' . $e->getMessage());
        }

        // Send confirmation to customer
        try {
            Mail::to($enquiry->email)
                ->send(new EnquiryConfirmation($enquiry));
        } catch (\Exception $e) {
            \Log::error('Failed to send customer email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'data' => $enquiry,
            'message' => 'Enquiry submitted successfully'
        ], 201);
    }

    /**
     * Get all enquiries (admin only)
     */
    public function index(Request $request)
    {
        $query = Enquiry::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or email
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

    /**
     * Get single enquiry details
     */
    public function show($id)
    {
        $enquiry = Enquiry::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $enquiry
        ]);
    }

    /**
     * Update enquiry status
     */
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
```

#### 5. Create Email Templates
**File**: `ih-backend/app/Mail/EnquiryReceived.php`

```php
<?php

namespace App\Mail;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnquiryReceived extends Mailable
{
    use Queueable, SerializesModels;

    public $enquiry;

    public function __construct(Enquiry $enquiry)
    {
        $this->enquiry = $enquiry;
    }

    public function build()
    {
        return $this->subject('New Enquiry Received - ' . $this->enquiry->package_title)
                    ->markdown('emails.enquiry-received');
    }
}
```

**File**: `ih-backend/resources/views/emails/enquiry-received.blade.php`

```blade
@component('mail::message')
# New Enquiry Received

You have received a new enquiry for **{{ $enquiry->package_title ?? 'General Enquiry' }}**

## Customer Details
- **Name:** {{ $enquiry->name }}
- **Email:** {{ $enquiry->email }}
- **Phone:** {{ $enquiry->phone }}
- **Travel Date:** {{ $enquiry->travel_date ? $enquiry->travel_date->format('d M Y') : 'Not specified' }}
- **Travelers:** {{ $enquiry->travelers }} person(s)

@if($enquiry->message)
## Message
{{ $enquiry->message }}
@endif

@component('mail::button', ['url' => config('app.admin_url') . '/enquiries/' . $enquiry->id])
View Enquiry
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
```

#### 6. Update Frontend to Call API
**File**: `ih-frontend/src/components/shared/EnquiryFormModal.tsx`

Replace the TODO section with:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  setSubmitStatus('idle')

  try {
    const enquiryData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      packageId,
      packageTitle,
      travelDates: formData.travelDates,
      travelers: formData.travelers,
      message: formData.message
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(enquiryData)
    })

    if (!response.ok) {
      throw new Error('Failed to submit enquiry')
    }

    const result = await response.json()
    console.log('Enquiry submitted successfully:', result)

    setSubmitStatus('success')
    
    // Reset and close
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        travelDates: '',
        travelers: '2'
      })
      setSubmitStatus('idle')
      onClose()
    }, 2000)
    
  } catch (error) {
    console.error('Failed to submit enquiry:', error)
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 📊 Checking Enquiries/Leads

### Option 1: Database Direct Access
```bash
cd ih-backend
php artisan tinker
```

```php
// Get all enquiries
$enquiries = App\Models\Enquiry::all();

// Get new enquiries
$new = App\Models\Enquiry::where('status', 'new')->get();

// Get recent enquiries
$recent = App\Models\Enquiry::orderBy('created_at', 'desc')->take(10)->get();

// Search by email
$customer = App\Models\Enquiry::where('email', 'john@example.com')->get();

// Get enquiries for specific package
$package = App\Models\Enquiry::where('package_id', 'rec_2')->get();
```

### Option 2: Admin Dashboard (Recommended)
Create an admin dashboard page to view and manage enquiries.

**File**: `ih-frontend/src/app/admin/enquiries/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Calendar, Users, Package } from 'lucide-react'

interface Enquiry {
  id: number
  name: string
  email: string
  phone: string
  package_title: string
  travel_date: string
  travelers: string
  message: string
  status: string
  created_at: string
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchEnquiries()
  }, [filter])

  const fetchEnquiries = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/v1/enquiries'
        : `/api/v1/enquiries?status=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      setEnquiries(data.data.data) // Paginated response
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/v1/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchEnquiries()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enquiry Management</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'new', 'contacted', 'quoted', 'converted', 'lost'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status 
                ? 'bg-sapphire-600 text-white' 
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        {enquiries.map(enquiry => (
          <div key={enquiry.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{enquiry.name}</h3>
                <p className="text-slate-600">{enquiry.package_title}</p>
              </div>
              <select
                value={enquiry.status}
                onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                className="px-3 py-1 border rounded-lg"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {enquiry.travel_date || 'Not specified'}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {enquiry.travelers} travelers
              </div>
            </div>

            {enquiry.message && (
              <div className="mt-4 p-3 bg-slate-50 rounded">
                <p className="text-sm">{enquiry.message}</p>
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500">
              Received: {new Date(enquiry.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Option 3: Email Notifications
All enquiries will be emailed to `bookings@ideaholiday.in` (configure in `.env`)

### Option 4: Export to Excel/CSV
Add export functionality:

```bash
cd ih-backend
composer require maatwebsite/excel
```

```php
// In EnquiryController.php
public function export()
{
    return Excel::download(new EnquiriesExport, 'enquiries.xlsx');
}
```

---

## 🔔 Environment Configuration

**File**: `ih-backend/.env`

```env
# Admin email for enquiries
MAIL_ADMIN_EMAIL=bookings@ideaholiday.in

# Admin dashboard URL
APP_ADMIN_URL=https://admin.ideaholiday.in
```

**File**: `ih-frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📈 Enquiry Lifecycle

```
New → Contacted → Quoted → Converted ✅
                          ↓
                        Lost ❌
```

### Status Definitions:
- **New**: Just received, not yet contacted
- **Contacted**: Customer has been called/emailed
- **Quoted**: Price quote sent to customer
- **Converted**: Customer booked the package 🎉
- **Lost**: Customer didn't book

---

## 🎯 Quick Start Checklist

- [ ] Run database migration
- [ ] Create Enquiry model and controller
- [ ] Set up email templates
- [ ] Update frontend API call
- [ ] Configure admin email in .env
- [ ] Create admin dashboard page
- [ ] Test enquiry submission
- [ ] Test email notifications
- [ ] Set up enquiry export

---

## 📞 Support & Testing

### Test Enquiry Submission:
1. Go to any package detail page
2. Click "Book This Package"
3. Fill in the enquiry form
4. Click "Send Enquiry"
5. Check:
   - Browser console for logs
   - Admin email inbox
   - Customer email inbox
   - Database: `SELECT * FROM enquiries ORDER BY created_at DESC;`

### Troubleshooting:
- **Form not submitting**: Check browser console for errors
- **Email not received**: Check `ih-backend/storage/logs/laravel.log`
- **Database error**: Ensure migration has run
- **API 404**: Check route is registered in `routes/api.php`

---

**Last Updated**: October 17, 2025  
**Status**: Development (needs backend integration)
