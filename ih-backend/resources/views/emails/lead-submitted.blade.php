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

@component('mail::button', ['url' => config('app.url') . '/admin/enquiries/' . $enquiry->id])
View Enquiry
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
