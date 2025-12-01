<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class UrgentAnnouncementNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Announcement $announcement)
    {
    }

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        return (new WebPushMessage())
            ->title('Urgent Dorm Announcement')
            ->icon('/favicon.ico')
            ->body($this->announcement->title)
            ->action('Open', 'open_announcement');
    }
}



