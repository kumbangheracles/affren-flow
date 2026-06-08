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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->ulid('transaksi_id')->primary();
            $table->foreignUlid('proyek_id')->constrained('proyek', 'proyek_id')->cascadeOnDelete();
            $table->enum('tipe', ['pemasukan', 'pengeluaran']);
            $table->enum('status', ['belum_disetujui', 'disetujui', 'lunas', 'ditolak'])->default('belum_disetujui');
            $table->enum('kategori', [
                'material',
                'operasional',
                'jasa_tukang',
                'mandor',
                'staff_perpajakan',
                'staff_entry_data',
                'biaya_tak_terduga',
            ]);

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('approved_by')
                ->nullable()                    // ← null saat baru dibuat
                ->constrained('users')
                ->nullOnDelete();
            $table->decimal('jumlah', 15, 2);
            $table->decimal('persen', 5, 2)->nullable();
            $table->date('tanggal');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
