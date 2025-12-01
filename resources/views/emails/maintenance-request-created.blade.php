@component('mail::message')
# New Maintenance Request

**Title:** {{ $request->title }}  
**Urgency:** {{ ucfirst($request->urgency) }}  
**Room:** {{ $request->room_number }}

{{ $request->description }}

@isset($request->attachment_url)
[View Attachment]({{ $request->attachment_url }})
@endisset

The request was filed by {{ optional($request->student)->name ?? 'a student' }}.

Thanks,<br>
{{ config('app.name') }}
@endcomponent



