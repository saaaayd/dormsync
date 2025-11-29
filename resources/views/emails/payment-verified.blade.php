@component('mail::message')
# Payment Verified

Hi {{ $payment->student->first_name }},

We have verified your payment of **PHP {{ number_format($payment->amount, 2) }}** for **{{ $payment->type }}** that was due on **{{ \Illuminate\Support\Carbon::parse($payment->due_date)->toFormattedDateString() }}**.

@isset($payment->receipt_url)
You can review the receipt you uploaded [here]({{ $payment->receipt_url }}).
@endisset

Thank you for staying up to date with your dorm fees.

Thanks,<br>
{{ config('app.name') }}
@endcomponent

