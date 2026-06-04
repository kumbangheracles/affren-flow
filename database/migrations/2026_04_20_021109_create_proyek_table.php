<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proyek', function (Blueprint $table) {
            $table->ulid('proyek_id')->primary();

            $table->string('nama_proyek');

            $table->foreignId('kategori_proyek_id')
                ->constrained('kategori_proyek');

            $table->foreignId('jenis_proyek_id')
                ->constrained('jenis_proyek');

            $table->decimal('pagu_total', 15, 2);

            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai')->nullable();

            $table->decimal('pajak_persen', 15, 2);
            // $table->decimal('uang_bahan_persen', 15, 2);
            // $table->decimal('jasa_tukang_persen', 15, 2);
            // $table->decimal('biaya_tak_terduga_persen', 15, 2);

            // $table->decimal('biaya_staff_perpajakan', 15, 2);
            // $table->decimal('biaya_staff_entry_data', 15, 2);

            $table->string('nama_klien');
            $table->enum('status', [
                'sedang_berjalan',
                'selesai',
                'dibatalkan'
            ]);

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete()
                ->default(1);

            $table->longText('deskripsi_proyek')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyek');
    }
};
