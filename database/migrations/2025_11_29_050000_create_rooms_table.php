<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->unsignedTinyInteger('capacity')->default(6);
            $table->timestamps();
        });

        DB::table('rooms')->insert([
            ['code' => 'Room 101', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'Room 102', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'Room 103', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'Room 104', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'Room 105', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'Room 106', 'capacity' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};

