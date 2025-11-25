<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_DEFAULT_EMAIL', 'admin@dormsync.com');
        $password = env('ADMIN_DEFAULT_PASSWORD', 'Admin123!');

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Dorm',
                'last_name' => 'Admin',
                'middle_initial' => null,
                'name' => 'Dorm Admin',
                'role' => 'admin',
                'password' => Hash::make($password),
            ]
        );
    }
}


