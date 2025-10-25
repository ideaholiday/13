<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Lead $lead)
    {
    }

    public function envelope(): Envelope
    {
        $subjectContext = $this->lead->post?->title ?? $this->lead->destination?->name ?? 'General';

        return new Envelope(
            subject: 'New Travel Enquiry — ' . $subjectContext,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.leads.submitted',
            with: [
                'lead' => $this->lead,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
