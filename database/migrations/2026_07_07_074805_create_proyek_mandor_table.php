<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyek_mandor', function (Blueprint $table) {
            $table->id();

            $table->foreignUlid('proyek_id')
                ->constrained('proyek', 'proyek_id')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();

            // biar gak ada duplikat mandor di proyek yang sama
            $table->unique(['proyek_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyek_mandor');
    }
};
