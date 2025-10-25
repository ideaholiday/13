@php
    $post = $lead->post;
    $destination = $lead->destination;
@endphp

<h1>New Travel Enquiry</h1>

<p>A new enquiry has been submitted on IdeaHoliday.</p>

<ul>
    <li><strong>Name:</strong> {{ $lead->name }}</li>
    <li><strong>Email:</strong> {{ $lead->email }}</li>
    @if($lead->phone)
        <li><strong>Phone:</strong> {{ $lead->phone }}</li>
    @endif
    <li><strong>Source:</strong> {{ ucfirst($lead->source) }}</li>
    @if($post)
        <li><strong>Related Post:</strong> {{ $post->title }}</li>
    @endif
    @if($destination)
        <li><strong>Destination:</strong> {{ $destination->name }}</li>
    @endif
    <li><strong>Status:</strong> {{ ucfirst($lead->status) }}</li>
    <li><strong>Submitted:</strong> {{ $lead->created_at->format('d M Y H:i') }}</li>
</ul>

@if($lead->message)
    <p><strong>Message:</strong></p>
    <p>{{ $lead->message }}</p>
@endif

@if($lead->utm_source || $lead->utm_medium || $lead->utm_campaign)
    <p><strong>Marketing Attribution</strong></p>
    <ul>
        @if($lead->utm_source)
            <li>UTM Source: {{ $lead->utm_source }}</li>
        @endif
        @if($lead->utm_medium)
            <li>UTM Medium: {{ $lead->utm_medium }}</li>
        @endif
        @if($lead->utm_campaign)
            <li>UTM Campaign: {{ $lead->utm_campaign }}</li>
        @endif
    </ul>
@endif

<p>Reply directly to the sender or update the lead inside the admin panel.</p>
