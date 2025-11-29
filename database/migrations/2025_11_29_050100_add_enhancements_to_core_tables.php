<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('student_id')->nullable()->unique()->after('id');
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->foreignId('room_id')
                ->nullable()
                ->after('user_id')
                ->constrained('rooms')
                ->nullOnDelete();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('receipt_drive_id')->nullable()->after('notes');
            $table->string('receipt_url')->nullable()->after('receipt_drive_id');
        });

        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->string('attachment_drive_id')->nullable()->after('status');
            $table->string('attachment_url')->nullable()->after('attachment_drive_id');
        });

        Schema::table('cleaning_schedules', function (Blueprint $table) {
            $table->string('calendar_event_id')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cleaning_schedules', function (Blueprint $table) {
            $table->dropColumn('calendar_event_id');
        });

        Schema::table('maintenance_requests', function (Blueprint $table) {
            $table->dropColumn(['attachment_drive_id', 'attachment_url']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['receipt_drive_id', 'receipt_url']);
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('room_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_student_id_unique');
            $table->dropColumn('student_id');
        });
    }
};

