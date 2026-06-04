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
        Schema::create('jenis_proyek', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_proyek_id')->constrained('kategori_proyek');
            $table->string('nama'); // SAB, Balai Warga, Paving Block, dll
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
        Schema::dropIfExists('jenis_proyek');
    }
};
