<?php

namespace App\Mail;

use App\Models\MaintenanceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewMaintenanceRequest extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public MaintenanceRequest $requestRecord)
    {
    }

    public function build(): self
    {
        return $this->subject('New Maintenance Request Submitted')
            ->markdown('emails.maintenance-request-created', [
                'request' => $this->requestRecord->load('student'),
            ]);
    }
}


