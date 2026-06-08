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
        Schema::create('item_transaksi', function (Blueprint $table) {
            $table->ulid('item_id')->primary();
            $table->foreignUlid('transaksi_id')
                ->constrained('transaksi', 'transaksi_id')
                ->cascadeOnDelete();
            $table->date('tanggal');
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->enum('status', ['belum_disetujui', 'disetujui', 'lunas', 'ditolak'])->default('belum_disetujui');
            $table->foreignId('approved_by')
                ->nullable()                    // ← null saat baru dibuat
                ->constrained('users')
                ->nullOnDelete();
            $table->string('nama_item');           // nama barang / kegiatan / kejadian
            $table->string('satuan')->nullable();  // kg, m3, unit — null untuk operasional
            $table->decimal('qty', 10, 2);
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('subtotal', 15, 2);   // qty × harga_satuan
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_transaksi');
    }
};
