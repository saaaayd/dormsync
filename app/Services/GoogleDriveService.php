<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleDriveService
{
    private ?Drive $drive = null;

    public function __construct(private readonly array $config)
    {
        if (empty($config['service_account']) || empty($config['folder_id'])) {
            return;
        }

        $client = new Client();
        $client->setApplicationName(config('app.name') . ' Drive Uploader');
        $client->setScopes([Drive::DRIVE]);
        $client->setAccessType('offline');

        $serviceAccount = $config['service_account'];
        $client->setAuthConfig($this->resolveCredentialsPath($serviceAccount));

        $this->drive = new Drive($client);
    }

    public function upload(UploadedFile $file, string $prefix = 'receipt'): array
    {
        if (!$this->drive) {
            throw new \RuntimeException('Google Drive is not configured.');
        }

        $name = sprintf(
            '%s_%s.%s',
            $prefix,
            Str::uuid()->toString(),
            $file->getClientOriginalExtension()
        );

        $driveFile = new DriveFile([
            'name' => $name,
            'parents' => [$this->config['folder_id']],
        ]);

        $created = $this->drive->files->create($driveFile, [
            'data' => file_get_contents($file->getRealPath()),
            'mimeType' => $file->getMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id,webViewLink,webContentLink',
        ]);

        $this->makeFilePublic($created->id);

        return [
            'id' => $created->id,
            'url' => $created->getWebViewLink() ?? $this->buildShareableUrl($created->id),
        ];
    }

    private function makeFilePublic(string $fileId): void
    {
        try {
            $permission = new Permission();
            $permission->setRole('reader');
            $permission->setType('anyone');

            $this->drive->permissions->create($fileId, $permission);
        } catch (\Throwable $exception) {
            Log::warning('Unable to set Google Drive file permission', [
                'file_id' => $fileId,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    private function buildShareableUrl(string $fileId): string
    {
        return sprintf('https://drive.google.com/uc?id=%s', $fileId);
    }

    private function resolveCredentialsPath(string $value): array|string
    {
        if (Str::endsWith($value, '.json') && file_exists($value)) {
            return $value;
        }

        $json = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $json;
        }

        throw new \RuntimeException('Invalid Google Drive credentials payload.');
    }
}

