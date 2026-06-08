<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaksi;
use App\Models\ItemTransaksi;
use App\Models\Proyek;
use App\Services\FinanceService;
use Illuminate\Support\Str;

class TransaksiSeeder extends Seeder
{
    public function run(): void
    {
        $financeService = new FinanceService();
        $proyeks        = Proyek::all();

        foreach ($proyeks as $proyek) {
            $anggaran = $financeService->hitungAnggaranProyek($proyek);
            $dana     = $anggaran['dana_setelah_pajak'];

            // Tiap proyek dapat semua kategori — 1 transaksi per kategori
            foreach (Transaksi::KATEGORI as $kategori) {

                // Kategori dengan item — jumlah dihitung dari items
                if (in_array($kategori, Transaksi::KATEGORI_DENGAN_ITEM)) {
                    $transaksi = Transaksi::create([
                        'transaksi_id' => Str::ulid(),
                        'proyek_id'    => $proyek->proyek_id,
                        'kategori'     => $kategori,
                        'persen'       => null,
                        'jumlah'       => 0, // akan diupdate setelah items dibuat
                        'tanggal'      => now()->subDays(rand(10, 60)),
                        'keterangan'   => "Transaksi {$kategori} - {$proyek->nama_proyek}",
                        'created_by' => 1,
                        'approved_by' => 1,
                        'status' => ['belum_disetujui', 'disetujui', 'lunas'][array_rand(['belum_disetujui', 'disetujui', 'lunas'])],
                    ]);

                    // Buat 2-4 item per transaksi
                    $totalJumlah = 0;
                    $jumlahItem  = rand(2, 4);

                    for ($i = 1; $i <= $jumlahItem; $i++) {
                        $qty          = rand(5, 100);
                        $hargaSatuan  = rand(50000, 500000);
                        $subtotal     = $qty * $hargaSatuan;
                        $totalJumlah += $subtotal;

                        [$namaItem, $satuan] = $this->generateItem($kategori, $i);

                        ItemTransaksi::create([
                            'item_id'      => Str::ulid(),
                            'transaksi_id' => $transaksi->transaksi_id,
                            'tanggal'      => now()->subDays(rand(1, 60)),
                            'nama_item'    => $namaItem,
                            'satuan'       => $satuan,
                            'qty'          => $qty,
                            'harga_satuan' => $hargaSatuan,
                            'subtotal'     => $subtotal,
                            'keterangan'   => "Item ke-{$i}",
                            'created_by' => 1,
                            'approved_by' => 1,
                            'status' => ['belum_disetujui', 'disetujui', 'lunas'][array_rand(['belum_disetujui', 'disetujui', 'lunas'])],
                        ]);
                    }

                    // Update jumlah transaksi dari total items
                    $transaksi->update(['jumlah' => $totalJumlah]);
                    // Hitung persen dari dana_setelah_pajak
                    $persen = $dana > 0 ? ($totalJumlah / $dana) * 100 : 0;
                    $transaksi->update(['persen' => round($persen, 2)]);
                    // Kategori langsung — jumlah dari persen × dana_setelah_pajak
                } else {
                    $persen = match ($kategori) {
                        'jasa_tukang'      => (float) $proyek->jasa_tukang_persen,
                        'mandor'           => 1.5,
                        'staff_perpajakan' => null,
                        'staff_entry_data' => null,
                        default            => null,
                    };

                    $jumlah = match ($kategori) {
                        'staff_perpajakan' => (float) $proyek->biaya_staff_perpajakan,
                        'staff_entry_data' => (float) $proyek->biaya_staff_entry_data,
                        default            => $dana * ($persen / 100),
                    };

                    Transaksi::create([
                        'transaksi_id' => Str::ulid(),
                        'proyek_id'    => $proyek->proyek_id,
                        'kategori'     => $kategori,
                        'persen'       => $persen,
                        'jumlah'       => $jumlah,
                        'tanggal'      => now()->subDays(rand(10, 60)),
                        'keterangan'   => "Transaksi {$kategori} - {$proyek->nama_proyek}",
                        'created_by' => 1,
                        'approved_by' => 1,
                        'status' => ['belum_disetujui', 'disetujui', 'lunas'][array_rand(['belum_disetujui', 'disetujui', 'lunas'])],
                    ]);
                }
            }
        }
    }

    /**
     * Generate nama item dan satuan sesuai kategori.
     */
    private function generateItem(string $kategori, int $index): array
    {
        $items = [
            'material' => [
                ['Semen Tiga Roda', 'sak'],
                ['Besi 10mm', 'batang'],
                ['Pasir Beton', 'm3'],
                ['Batu Split', 'm3'],
                ['Kayu Bekisting', 'lembar'],
                ['Cat Tembok', 'kaleng'],
                ['Keramik 60x60', 'dus'],
                ['Pipa PVC 4 inch', 'batang'],
            ],
            'operasional' => [
                ['Sewa Excavator', 'hari'],
                ['Sewa Molen Beton', 'hari'],
                ['Transportasi Material', 'trip'],
                ['Bahan Bakar Genset', 'liter'],
                ['Sewa Scaffolding', 'set'],
                ['Konsumsi Pekerja', 'hari'],
            ],
            'biaya_tak_terduga' => [
                ['Perbaikan Pipa Bocor', 'kali'],
                ['Penggantian Material Rusak', 'unit'],
                ['Biaya Lembur Darurat', 'hari'],
                ['Perbaikan Alat Rusak', 'kali'],
            ],
        ];

        $list  = $items[$kategori] ?? [["Item {$kategori} {$index}", 'unit']];
        $pick  = $list[($index - 1) % count($list)];

        return $pick;
    }
}
