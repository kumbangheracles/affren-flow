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
        Schema::create('proyek_images', function (Blueprint $table) {
            $table->id();

            $table->foreignUlid('proyek_id')
                ->references('proyek_id')
                ->on('proyek')
                ->cascadeOnDelete();
            $table->string('image_url');
            $table->string('public_id')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyek_images');
    }
};
