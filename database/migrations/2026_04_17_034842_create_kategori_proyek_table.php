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
        Schema::create('kategori_proyek', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // Gedung, Jalan, Irigasi
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete()
                ->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_proyek');
    }
};
