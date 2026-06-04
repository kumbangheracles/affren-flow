<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JenisProyek;

class JenisProyekSeeder extends Seeder
{
    public function run(): void
    {
        JenisProyek::insert([
            // GEDUNG
            [
                'kategori_proyek_id' => 1,
                'created_by' => 1,

                'nama' => 'SAB',
                'created_at' => now(),
                'updated_at' => now()
            ],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Balai Warga', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'GSG', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Taman Baca', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Gedung Pendidikan', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Gedung Kesehatan', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Gedung Umum', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,      'created_by' => 1, 'nama' => 'Penataan Fasos Fasum', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Gapura', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Rumah Tidak Layak Huni (Bedah Rumah)', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 1,       'created_by' => 1, 'nama' => 'Pemagaran', 'created_at' => now(), 'updated_at' => now()],

            // IRIGASI
            ['kategori_proyek_id' => 2,       'created_by' => 1, 'nama' => 'U-DITCH', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 2,      'created_by' => 1, 'nama' => 'TPT (TURAB)', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 2,       'created_by' => 1, 'nama' => 'SPAL Rumah Tangga (Batu Kali)', 'created_at' => now(), 'updated_at' => now()],

            // JALAN
            ['kategori_proyek_id' => 3,      'created_by' => 1, 'nama' => 'Paving Block', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 3,       'created_by' => 1, 'nama' => 'Betonisasi', 'created_at' => now(), 'updated_at' => now()],
            ['kategori_proyek_id' => 3,       'created_by' => 1, 'nama' => 'Hotmix (Aspal)', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
