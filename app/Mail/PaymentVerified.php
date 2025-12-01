<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PaymentVerified extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Payment $payment)
    {
    }

    public function build(): self
    {
        return $this->subject('DormSync Payment Verified')
            ->markdown('emails.payment-verified', [
                'payment' => $this->payment->load('student'),
            ]);
    }
}


