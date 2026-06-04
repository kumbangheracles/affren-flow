<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Proyek;

class ProyekSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proyek::create([
            'nama_proyek' => 'Pembangunan Jalan Desa A',
            'kategori_proyek_id' => 3, // Jalan
            'jenis_proyek_id' => 16,   // Paving Block 
            'pagu_total' => 150000000,
            'tanggal_mulai' => '2025-01-10',
            'tanggal_selesai' => '2025-03-15',
            'pajak_persen' => 11.00,
            'created_by' => 1,
            // 'uang_bahan_persen' => 40.00,
            // 'jasa_tukang_persen' => 30.00,
            // 'biaya_tak_terduga_persen' => 25.00,
            // 'biaya_staff_perpajakan' => 5000000,
            // 'biaya_staff_entry_data' => 3000000,
            'nama_klien' => 'PT Maju Jaya',
            'status' => 'sedang_berjalan',
            'deskripsi_proyek' => 'Proyek pembangunan jalan desa dengan paving block.'
        ]);

        Proyek::create([
            'nama_proyek' => 'Drainase U-Ditch Kota B',
            'kategori_proyek_id' => 2, // Irigasi
            'jenis_proyek_id' => 12,   // Udith
            'pagu_total' => 250000000,
            'created_by' => 1,
            'tanggal_mulai' => '2025-02-01',
            'tanggal_selesai' => '2025-05-30',
            'pajak_persen' => 11.00,
            // 'uang_bahan_persen' => 50.00,
            // 'jasa_tukang_persen' => 25.00,
            // 'biaya_tak_terduga_persen' => 20.00,
            // 'biaya_staff_perpajakan' => 7000000,
            // 'biaya_staff_entry_data' => 3500000,
            'nama_klien' => 'CV Sumber Rejeki',
            'status' => 'sedang_berjalan',
            'deskripsi_proyek' => 'Pembangunan saluran drainase menggunakan U-Ditch.'
        ]);

        Proyek::create([
            'nama_proyek' => 'Perbaikan Beton Jalan Raya',
            'kategori_proyek_id' => 3, // Jalan
            'jenis_proyek_id' => 17,   // Betonisasi
            'pagu_total' => 500000000,
            'created_by' => 1,
            'tanggal_mulai' => '2024-11-01',
            'tanggal_selesai' => '2025-01-20',
            'pajak_persen' => 11.00,
            // 'uang_bahan_persen' => 45.00,
            // 'jasa_tukang_persen' => 35.00,
            // 'biaya_tak_terduga_persen' => 10.00,
            // 'biaya_staff_perpajakan' => 10000000,
            // 'biaya_staff_entry_data' => 5000000,
            'nama_klien' => 'Dinas PUPR',
            'status' => 'selesai',
            'deskripsi_proyek' => 'Perbaikan jalan beton utama kota.'
        ]);

        for ($i = 1; $i <= 20; $i++) {

            $kategori = [1, 2, 3][array_rand([1, 2, 3])];

            $jenisMap = [
                1 => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Gedung
                2 => [12, 13, 14],               // Irigasi
                3 => [15, 16, 17],               // Jalan
            ];

            Proyek::create([
                'nama_proyek' => "Proyek {$i}",
                'created_by' => 1,
                'kategori_proyek_id' => $kategori,
                'jenis_proyek_id' => $jenisMap[$kategori][array_rand($jenisMap[$kategori])],
                'pagu_total' => rand(100000000, 500000000),
                'tanggal_mulai' => now()->subDays(rand(1, 100)),
                'tanggal_selesai' => now()->addDays(rand(10, 150)),
                'pajak_persen' => 11,
                // 'uang_bahan_persen' => rand(30, 50),
                // 'jasa_tukang_persen' => rand(20, 40),
                // 'biaya_tak_terduga_persen' => rand(5, 20),
                // 'biaya_staff_perpajakan' => rand(3000000, 8000000),
                // 'biaya_staff_entry_data' => rand(2000000, 5000000),
                'nama_klien' => 'PT Random',
                'status' => ['sedang_berjalan', 'selesai', 'dibatalkan'][array_rand(['sedang_berjalan', 'selesai', 'dibatalkan'])],
                'deskripsi_proyek' => "Deskripsi proyek {$i}",
            ]);
        }
    }
}
